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
    if (!stripeSecret || !supabaseUrl || !serviceRole || !siteUrl) throw new Error("Checkout function environment is not fully configured.");

    const body = await request.json();
    const planKey = String(body.plan || "") as keyof typeof plans;
    const plan = plans[planKey];
    const registration = String(body.registration || "").trim().toUpperCase();
    const customerName = String(body.customerName || "").trim();
    const customerEmail = String(body.customerEmail || "").trim().toLowerCase();
    const customerPhone = String(body.customerPhone || "").trim();
    const dateOfBirth = String(body.dateOfBirth || "");
    const address = String(body.address || "").trim();
    const drivingLicenseNumber = String(body.drivingLicenseNumber || "").trim().toUpperCase();
    const vehicleMake = String(body.vehicleMake || "").trim();
    const vehicleModel = String(body.vehicleModel || "").trim();
    const vehicleYear = Number(body.vehicleYear);
    const vehicleColour = String(body.vehicleColour || "").trim();
    const fuelType = String(body.fuelType || "").trim();
    const startValue = String(body.coverStart || "");
    if (!plan || registration.length < 2 || registration.length > 8 || !/^[A-Z0-9 ]+$/.test(registration) ||
        !customerName || customerName.length > 120 || !customerPhone || customerPhone.length > 30 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail) || !/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth) ||
        !address || address.length > 300 || !drivingLicenseNumber || drivingLicenseNumber.length > 32 ||
        !vehicleMake || vehicleMake.length > 60 || !vehicleModel || vehicleModel.length > 60 ||
        !vehicleColour || vehicleColour.length > 40 || !["Petrol","Diesel","Hybrid","Plug-in hybrid","Electric","Other"].includes(fuelType) ||
        !Number.isFinite(Date.parse(startValue))) return json({ error: "Please check your details and try again." }, 400);

    const start = new Date(startValue);
    if (start.getTime() < Date.now() - 5 * 60 * 1000) return json({ error: "Choose a start time in the future." }, 400);
    const end = new Date(start.getTime() + plan.days * 24 * 60 * 60 * 1000);
    const supabase = createClient(supabaseUrl, serviceRole);
    const { data: application, error: applicationError } = await supabase.from("checkout_applications").insert({
      customer_name: customerName, customer_email: customerEmail, customer_phone: customerPhone,
      driver_date_of_birth: dateOfBirth, customer_address: address, driving_license_number: drivingLicenseNumber,
      vehicle_registration: registration, vehicle_make: vehicleMake, vehicle_model: vehicleModel,
      vehicle_colour: vehicleColour, fuel_type: fuelType, plan: planKey,
      cover_start: start.toISOString(), cover_end: end.toISOString(),
    }).select("id").single();
    if (applicationError || !application) throw new Error("Could not save your application. Please try again.");

    const stripe = new Stripe(stripeSecret, { httpClient: Stripe.createFetchHttpClient() });
    try {
      const session = await stripe.checkout.sessions.create({
        mode: "payment", payment_method_types: ["card"], customer_email: customerEmail, client_reference_id: customerEmail,
        line_items: [{ quantity: 1, price_data: { currency: "gbp", unit_amount: plan.amount, product_data: { name: `GoShorty ${plan.label} package`, description: `Vehicle: ${registration}` } } }],
        metadata: { application_id: application.id },
        success_url: `${siteUrl.replace(/\/$/, "")}/payment-success/?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${siteUrl.replace(/\/$/, "")}/get-a-quote/?cancelled=1`,
      });
      return json({ url: session.url });
    } catch (error) {
      await supabase.from("checkout_applications").delete().eq("id", application.id);
      throw error;
    }
  } catch (error) {
    console.error("create-checkout-session:", error);
    return json({ error: error instanceof Error ? error.message : "Unable to start checkout." }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
