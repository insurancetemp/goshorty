import { createClient } from "npm:@supabase/supabase-js@2";
import Stripe from "npm:stripe@17";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const plans = {
  daily: { amount: 2000, days: 1, label: "Daily" },
  weekly: { amount: 10000, days: 7, label: "Weekly" },
  monthly: { amount: 25000, days: 30, label: "Monthly" },
} as const;

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const siteUrl = Deno.env.get("SITE_URL");
    if (!stripeSecret || !supabaseUrl || !serviceRole || !siteUrl) {
      throw new Error("Checkout function environment is not fully configured.");
    }

    const body = await request.json();
    const planKey = String(body.plan || "") as keyof typeof plans;
    const plan = plans[planKey];
    const registration = String(body.registration || "").trim().toUpperCase();
    const customerName = String(body.customerName || "").trim();
    const customerEmail = String(body.customerEmail || "").trim().toLowerCase();
    const customerPhone = String(body.customerPhone || "").trim();
    const dateOfBirth = String(body.dateOfBirth || "");
    const startValue = String(body.coverStart || "");
    if (!plan || registration.length < 2 || registration.length > 8 ||
        !/^[A-Z0-9 ]+$/.test(registration) || !customerName || !customerPhone || !/^\\d{4}-\\d{2}-\\d{2}$/.test(dateOfBirth) ||
        customerName.length > 120 || customerPhone.length > 30 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail) ||
        !Number.isFinite(Date.parse(startValue))) {
      return json({ error: "Please check your details and try again." }, 400);
    }

    const start = new Date(startValue);
    if (start.getTime() < Date.now() - 5 * 60 * 1000) {
      return json({ error: "Choose a start time in the future." }, 400);
    }
    const end = new Date(start.getTime() + plan.days * 24 * 60 * 60 * 1000);
    const stripe = new Stripe(stripeSecret, { httpClient: Stripe.createFetchHttpClient() });
    const supabase = createClient(supabaseUrl, serviceRole);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: customerEmail,
      client_reference_id: customerEmail,
      line_items: [{
        quantity: 1,
        price_data: {
          currency: "gbp",
          unit_amount: plan.amount,
          product_data: { name: `GoShorty ${plan.label} package`, description: `Vehicle: ${registration}` },
        },
      }],
      metadata: {
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        driver_date_of_birth: dateOfBirth,
        vehicle_registration: registration,
        plan: planKey,
        cover_start: start.toISOString(),
        cover_end: end.toISOString(),
      },
      success_url: `${siteUrl.replace(/\/$/, "")}/payment-success/?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl.replace(/\/$/, "")}/get-a-quote/?cancelled=1`,
    });

    return json({ url: session.url });
  } catch (error) {
    console.error("create-checkout-session:", error);
    return json({ error: error instanceof Error ? error.message : "Unable to start checkout." }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
