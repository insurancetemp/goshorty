import { createClient } from "npm:@supabase/supabase-js@2";
import Stripe from "npm:stripe@17";

Deno.serve(async (request) => {
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!stripeSecret || !webhookSecret || !supabaseUrl || !serviceRole) {
    return new Response("Webhook environment is not configured", { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) return new Response("Missing Stripe signature", { status: 400 });

  const stripe = new Stripe(stripeSecret, { httpClient: Stripe.createFetchHttpClient() });
  const rawBody = await request.text();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(rawBody, signature, webhookSecret);
  } catch (error) {
    console.error("Stripe signature verification failed:", error);
    return new Response("Invalid signature", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.payment_status !== "paid") return new Response("Payment not completed", { status: 200 });

    const metadata = session.metadata || {};
    const email = metadata.customer_email || session.customer_details?.email;
    const name = metadata.customer_name || session.customer_details?.name || "GoShorty customer";
    const registration = metadata.vehicle_registration;
    const plan = metadata.plan;
    const start = metadata.cover_start;
    const end = metadata.cover_end;
    if (!email || !registration || !plan || !start || !end) {
      console.error("Completed checkout is missing required metadata", session.id);
      return new Response("Missing checkout metadata", { status: 400 });
    }

    const supabase = createClient(supabaseUrl, serviceRole);
    const { data: existing } = await supabase
      .from("orders").select("id").eq("stripe_checkout_session_id", session.id).maybeSingle();
    if (!existing) {
      const orderReference = `GS-${new Date().getUTCFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
      const { error } = await supabase.from("orders").insert({
        customer_email: email.toLowerCase(),
        customer_name: name,
        vehicle_registration: registration,
        plan,
        amount_pence: session.amount_total,
        currency: session.currency,
        cover_start: start,
        cover_end: end,
        stripe_checkout_session_id: session.id,
        stripe_payment_intent_id: typeof session.payment_intent === "string" ? session.payment_intent : null,
        payment_status: "paid",
        order_reference: orderReference,
      });
      if (error) {
        console.error("Unable to save paid order:", error);
        return new Response("Could not save order", { status: 500 });
      }
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
