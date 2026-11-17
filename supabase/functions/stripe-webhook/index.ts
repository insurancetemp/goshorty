import { createClient } from "npm:@supabase/supabase-js@2";
import Stripe from "npm:stripe@17";
Deno.serve(async (request) => {
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY"), webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const supabaseUrl = Deno.env.get("SUPABASE_URL"), serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const siteUrl = Deno.env.get("SITE_URL"), resendKey = Deno.env.get("RESEND_API_KEY"), emailFrom = Deno.env.get("EMAIL_FROM");
  if (!stripeSecret || !webhookSecret || !supabaseUrl || !serviceRole || !siteUrl || !resendKey || !emailFrom) return new Response("Webhook environment is not configured", { status: 500 });
  const signature = request.headers.get("stripe-signature");
  if (!signature) return new Response("Missing Stripe signature", { status: 400 });
  const stripe = new Stripe(stripeSecret, { httpClient: Stripe.createFetchHttpClient() });
  let event: Stripe.Event;
  try { event = await stripe.webhooks.constructEventAsync(await request.text(), signature, webhookSecret); }
  catch (error) { console.error(error); return new Response("Invalid signature", { status: 400 }); }
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.payment_status !== "paid") return new Response("Payment not completed", { status: 200 });
    const applicationId = session.metadata?.application_id;
    if (!applicationId) return new Response("Missing application reference", { status: 400 });
    const supabase = createClient(supabaseUrl, serviceRole);
    const { data: application, error: applicationError } = await supabase.from("checkout_applications").select("*").eq("id", applicationId).single();
    if (applicationError || !application) return new Response("Could not load application details", { status: 500 });
    const email = application.customer_email, name = application.customer_name;
    const { data: existing, error: lookupError } = await supabase.from("orders").select("id,order_reference,email_sent_at").eq("stripe_checkout_session_id", session.id).maybeSingle();
    if (lookupError) return new Response("Could not look up order", { status: 500 });
    let orderRef = existing?.order_reference;
    if (!existing) {
      const created = await supabase.auth.admin.createUser({ email, email_confirm: true, user_metadata: { full_name: name } });
      let userId = created.data.user?.id || null;
      if (!userId) {
        const users = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
        userId = users.data.users.find((u) => u.email?.toLowerCase() === email)?.id || null;
      }
      if (!userId) { console.error("Could not create/find customer:", created.error); return new Response("Could not create customer account", { status: 500 }); }
      orderRef = "GS-" + new Date().getUTCFullYear() + "-" + crypto.randomUUID().slice(0, 8).toUpperCase();
      const { error } = await supabase.from("orders").insert({
        user_id: userId, customer_email: email, customer_name: name, customer_phone: application.customer_phone,
        driver_date_of_birth: application.driver_date_of_birth, customer_address: application.customer_address,
        driving_license_number: application.driving_license_number, vehicle_registration: application.vehicle_registration,
        vehicle_make: application.vehicle_make, vehicle_model: application.vehicle_model, vehicle_colour: application.vehicle_colour,
        fuel_type: application.fuel_type, plan: application.plan, amount_pence: session.amount_total, currency: session.currency,
        cover_start: application.cover_start, cover_end: application.cover_end, stripe_checkout_session_id: session.id,
        stripe_payment_intent_id: typeof session.payment_intent === "string" ? session.payment_intent : null,
        payment_status: "paid", order_reference: orderRef
      });
      if (error) { console.error(error); return new Response("Could not save order", { status: 500 }); }
    }
    if (!existing?.email_sent_at) {
      const link = await supabase.auth.admin.generateLink({ type: "recovery", email, options: { redirectTo: siteUrl.replace(/\/$/, "") + "/set-password/" } });
      if (link.error || !link.data.properties?.action_link) { console.error(link.error); return new Response("Could not create password setup link", { status: 500 }); }
      const startText = new Date(application.cover_start).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/London" });
      const endText = new Date(application.cover_end).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/London" });
      const html = "<h1>Thanks for your order, " + safe(name) + "</h1><p>Your payment has been received.</p><p><b>Order:</b> " + orderRef +
        "<br><b>Vehicle:</b> " + safe(application.vehicle_registration) + " · " + safe(application.vehicle_make) + " " + safe(application.vehicle_model) +
        "<br><b>Colour:</b> " + safe(application.vehicle_colour) + "<br><b>Fuel:</b> " + safe(application.fuel_type) +
        "<br><b>Package:</b> " + safe(application.plan) + "<br><b>Driver DOB:</b> " + safe(application.driver_date_of_birth) +
        "<br><b>Contact:</b> " + safe(application.customer_phone) + "<br><b>Address:</b> " + safe(application.customer_address) +
        "<br><b>Start:</b> " + startText + "<br><b>End:</b> " + endText + "<br><b>Paid:</b> £" + ((session.amount_total || 0) / 100).toFixed(2) +
        "</p><p><a href=\"" + link.data.properties.action_link + "\">Set your account password</a></p><p>Sign in to your GoShorty portal to view your order details.</p>";
      const sent = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: "Bearer " + resendKey, "Content-Type": "application/json" }, body: JSON.stringify({ from: emailFrom, to: [email], subject: "Your GoShorty order confirmation - " + orderRef, html }) });
      if (!sent.ok) { console.error(await sent.text()); return new Response("Order saved but email failed", { status: 500 }); }
      const { error: updateError } = await supabase.from("orders").update({ email_sent_at: new Date().toISOString() }).eq("stripe_checkout_session_id", session.id);
      if (updateError) { console.error(updateError); return new Response("Email sent but delivery status could not be saved", { status: 500 }); }
    }
    await supabase.from("checkout_applications").delete().eq("id", applicationId);
  }
  return new Response(JSON.stringify({ received: true }), { status: 200, headers: { "Content-Type": "application/json" } });
});
function safe(s: string) { return String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;"); }
