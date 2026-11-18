import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const adminEmails = (Deno.env.get("ADMIN_EMAILS") || "").split(",").map((email) => email.trim().toLowerCase()).filter(Boolean);
  const siteUrl = (Deno.env.get("SITE_URL") || "").replace(/\/$/, "");
  const resendKey = Deno.env.get("RESEND_API_KEY");
  const emailFrom = Deno.env.get("EMAIL_FROM");

  if (!supabaseUrl || !anonKey || !serviceRole || adminEmails.length === 0) {
    return json({ error: "Admin function environment is not configured." }, 500);
  }

  const authorization = request.headers.get("Authorization") || "";
  const token = authorization.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return json({ error: "Please sign in first." }, 401);

  // Verify the caller's access token before creating a service-role client.
  const authClient = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: authData, error: authError } = await authClient.auth.getUser(token);
  if (authError || !authData.user?.email) return json({ error: "Your session is invalid. Please sign in again." }, 401);
  if (!adminEmails.includes(authData.user.email.toLowerCase())) return json({ error: "You are not authorised to access the admin portal." }, 403);

  const admin = createClient(supabaseUrl, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    const body = await request.json();
    if (body.action === "list-orders") {
      const { data, error } = await admin.from("orders").select("*").order("created_at", { ascending: false }).limit(300);
      if (error) throw error;
      return json({ orders: data || [] });
    }

    if (body.action !== "create-free-order") return json({ error: "Unknown admin action." }, 400);

    const d = body.customer || {};
    const required = [
      "customerName", "customerEmail", "customerPhone", "dateOfBirth", "address",
      "drivingLicenseNumber", "registration", "vehicleMake", "vehicleModel",
      "vehicleYear", "vehicleColour", "fuelType", "plan", "coverStart",
    ];
    for (const field of required) {
      if (d[field] === undefined || d[field] === null || String(d[field]).trim() === "") {
        return json({ error: "Please complete all customer, vehicle and cover fields." }, 400);
      }
    }

    const email = String(d.customerEmail).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: "Enter a valid customer email address." }, 400);
    if (!["daily", "weekly", "monthly"].includes(d.plan)) return json({ error: "Choose a valid cover period." }, 400);
    const year = Number(d.vehicleYear);
    if (!Number.isInteger(year) || year < 1886 || year > new Date().getFullYear() + 1) return json({ error: "Enter a valid vehicle year." }, 400);

    const coverStart = new Date(d.coverStart);
    if (Number.isNaN(coverStart.getTime())) return json({ error: "Enter a valid cover start date and time." }, 400);
    const durationDays = d.plan === "daily" ? 1 : d.plan === "weekly" ? 7 : 30;
    const coverEnd = new Date(coverStart.getTime() + durationDays * 24 * 60 * 60 * 1000);

    let userId: string | null = null;
    let page = 1;
    while (!userId) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
      if (error) throw error;
      const found = data.users.find((user) => user.email?.toLowerCase() === email);
      if (found) userId = found.id;
      if (found || data.users.length < 1000) break;
      page += 1;
    }

    let accountCreated = false;
    if (!userId) {
      const { data, error } = await admin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { full_name: String(d.customerName).trim() },
      });
      if (error) throw error;
      userId = data.user?.id || null;
      accountCreated = Boolean(userId);
    }
    if (!userId) throw new Error("Could not create or locate the customer's account.");

    const orderReference = "GS-" + new Date().getUTCFullYear() + "-" + crypto.randomUUID().slice(0, 8).toUpperCase();
    const { data: order, error: insertError } = await admin.from("orders").insert({
      user_id: userId,
      customer_email: email,
      customer_name: String(d.customerName).trim(),
      customer_phone: String(d.customerPhone).trim(),
      driver_date_of_birth: d.dateOfBirth,
      customer_address: String(d.address).trim(),
      driving_license_number: String(d.drivingLicenseNumber).trim().toUpperCase(),
      vehicle_registration: String(d.registration).trim().toUpperCase(),
      vehicle_make: String(d.vehicleMake).trim(),
      vehicle_model: String(d.vehicleModel).trim(),
      vehicle_year: year,
      vehicle_colour: String(d.vehicleColour).trim(),
      fuel_type: String(d.fuelType).trim(),
      plan: d.plan,
      amount_pence: 0,
      currency: "gbp",
      cover_start: coverStart.toISOString(),
      cover_end: coverEnd.toISOString(),
      stripe_checkout_session_id: null,
      stripe_payment_intent_id: null,
      payment_status: "complimentary",
      order_reference: orderReference,
      admin_created_by: authData.user.id,
    }).select().single();
    if (insertError) throw insertError;

    let emailSent = false;
    let emailWarning: string | null = null;
    if (siteUrl && resendKey && emailFrom) {
      const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
        type: "recovery",
        email,
        options: { redirectTo: siteUrl + "/set-password/" },
      });
      const actionLink = linkData?.properties?.action_link;
      if (linkError || !actionLink) {
        emailWarning = "The order was created, but the password setup link could not be generated. You can resend account access from Supabase.";
      } else {
        const startText = coverStart.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/London" });
        const endText = coverEnd.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/London" });
        const html = "<h1>Hello " + safe(d.customerName) + "</h1><p>Your GoShorty portal account and complimentary order have been created.</p><p><b>Order:</b> " + safe(orderReference) +
          "<br><b>Vehicle:</b> " + safe(d.registration) + " · " + safe(d.vehicleMake) + " " + safe(d.vehicleModel) +
          "<br><b>Year:</b> " + year + "<br><b>Colour:</b> " + safe(d.vehicleColour) + "<br><b>Fuel:</b> " + safe(d.fuelType) +
          "<br><b>Package:</b> " + safe(d.plan) + "<br><b>Start:</b> " + startText + "<br><b>End:</b> " + endText +
          "<br><b>Amount:</b> £0.00</p><p><a href=\"" + actionLink + "\">Set your account password</a></p><p>You can then sign in to your GoShorty portal to view your order.</p>";
        const sent = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: "Bearer " + resendKey, "Content-Type": "application/json" },
          body: JSON.stringify({ from: emailFrom, to: [email], subject: "Your GoShorty account and order - " + orderReference, html }),
        });
        if (sent.ok) {
          emailSent = true;
          await admin.from("orders").update({ email_sent_at: new Date().toISOString() }).eq("id", order.id);
        } else {
          console.error("Resend error:", await sent.text());
          emailWarning = "The order was created, but the customer email could not be sent.";
        }
      }
    } else {
      emailWarning = "The order was created, but email settings are not configured.";
    }

    return json({ order, accountCreated, emailSent, emailWarning });
  } catch (error) {
    console.error("Admin portal error:", error);
    return json({ error: error instanceof Error ? error.message : "Admin request failed." }, 500);
  }
});

function safe(value: unknown) {
  return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&#39;");
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
