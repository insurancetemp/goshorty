"use client";

import { FormEvent, Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const prices = { daily: 20, weekly: 100, monthly: 250 } as const;
type Plan = keyof typeof prices;

function supabaseBrowser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Supabase browser settings are missing. Add the public project URL and publishable key.");
  return createClient(url, key);
}

function GetAQuoteForm() {
  const params = useSearchParams();
  const initialReg = (params.get("reg") || "").toUpperCase();
  const initialPlan = (params.get("plan") || "daily") as Plan;
  const [registration, setRegistration] = useState(initialReg);
  const [plan, setPlan] = useState<Plan>(initialPlan in prices ? initialPlan : "daily");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [address, setAddress] = useState("");
  const [drivingLicenseNumber, setDrivingLicenseNumber] = useState("");
  const [vehicleMake, setVehicleMake] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleColour, setVehicleColour] = useState("");
  const [fuelType, setFuelType] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const price = useMemo(() => prices[plan], [plan]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    if (!registration.trim() || !startDate || !startTime || !customerName.trim() || !customerEmail.trim() || !customerPhone.trim() || !dateOfBirth || !address.trim() || !drivingLicenseNumber.trim() || !vehicleMake.trim() || !vehicleModel.trim() || !vehicleColour.trim() || !fuelType) {
      setNotice("Please complete all the fields to continue.");
      return;
    }
    const coverStart = new Date(`${startDate}T${startTime}`);
    if (Number.isNaN(coverStart.getTime()) || coverStart.getTime() < Date.now() - 5 * 60 * 1000) {
      setNotice("Please choose a start date and time in the future.");
      return;
    }
    setLoading(true);
    try {
      const supabase = supabaseBrowser();
      const { data, error } = await supabase.functions.invoke("create-checkout-session", {
        body: {
          registration: registration.trim().toUpperCase(),
          plan,
          coverStart: coverStart.toISOString(),
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim(),
          customerPhone: customerPhone.trim(),
          dateOfBirth,
          address: address.trim(),
          drivingLicenseNumber: drivingLicenseNumber.trim(),
          vehicleMake: vehicleMake.trim(),
          vehicleModel: vehicleModel.trim(),
          vehicleColour: vehicleColour.trim(),
          fuelType,
        },
      });
      if (error) throw error;
      if (!data?.url) throw new Error(data?.error || "Stripe did not return a checkout link.");
      window.location.assign(data.url);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to start checkout. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="getquote-page">
      <header className="site-header">
        <div className="container header-inner">
          <Link className="brand" href="/" aria-label="GoShorty home"><img className="brand-logo" src="https://www.ballantineinsuranceni.co.uk/wp-content/uploads/goshorty-logo-master-rgb-1852px%4072ppi.jpg" alt="GoShorty" /></Link>
          <Link className="header-signin" href="/sign-in/"><span>Sign In</span></Link>
        </div>
      </header>
      <section className="getquote-shell">
        <div className="container getquote-container">
          <div className="getquote-heading">
            <span className="section-kicker">TEMPORARY CAR INSURANCE</span>
            <h1>Let’s get your quote started</h1>
            <p>Tell us about the car and when you need cover. The fixed price is the same for any car and any driver age.</p>
          </div>
          <div className="getquote-layout">
            <form className="getquote-form" onSubmit={submit}>
              <div className="journey-progress"><span className="journey-step-active">1 <small>Car &amp; cover</small></span><i /><span className="journey-step-active">2 <small>Your details</small></span><i /><span>3 <small>Payment</small></span></div>
              <h2>1. Your car</h2>
              <label htmlFor="vehicle-reg">Vehicle registration</label>
              <div className="registration-field getquote-registration">
                <span className="gb-mark"><span>🇬🇧</span><small>UK</small></span>
                <input id="vehicle-reg" value={registration} onChange={e => setRegistration(e.target.value.toUpperCase())} placeholder="ENTER REG" maxLength={8} autoComplete="off" required />
              </div>
              <p className="field-help">Enter the registration number of the car you want to insure.</p>
              <div className="form-section-rule" />
              <h2>2. Choose your cover period</h2>
              <div className="cover-plan-options">
                <label className={plan === "daily" ? "cover-plan-option selected" : "cover-plan-option"}><input type="radio" name="plan" value="daily" checked={plan === "daily"} onChange={() => setPlan("daily")} /><span><strong>Daily</strong><small>1 day</small></span><b>£20</b></label>
                <label className={plan === "weekly" ? "cover-plan-option selected" : "cover-plan-option"}><input type="radio" name="plan" value="weekly" checked={plan === "weekly"} onChange={() => setPlan("weekly")} /><span><strong>Weekly</strong><small>7 days</small></span><b>£100</b></label>
                <label className={plan === "monthly" ? "cover-plan-option selected" : "cover-plan-option"}><input type="radio" name="plan" value="monthly" checked={plan === "monthly"} onChange={() => setPlan("monthly")} /><span><strong>Monthly</strong><small>30 days</small></span><b>£250</b></label>
              </div>
              <div className="form-section-rule" />
              <h2>3. Your details</h2>
              <label htmlFor="customer-name">Full name</label>
              <input id="customer-name" value={customerName} onChange={e => setCustomerName(e.target.value)} autoComplete="name" required />
              <label htmlFor="customer-email" style={{ marginTop: 15 }}>Email address</label>
              <input id="customer-email" type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} autoComplete="email" required />
              <label htmlFor="customer-phone" style={{ marginTop: 15 }}>Mobile number</label>
              <input id="customer-phone" type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} autoComplete="tel" required />
              <label htmlFor="driver-dob" style={{ marginTop: 15 }}>Date of birth</label>
              <input id="driver-dob" type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} autoComplete="bday" required />
              <label htmlFor="customer-address" style={{ marginTop: 15 }}>Full address</label>
              <textarea id="customer-address" value={address} onChange={e => setAddress(e.target.value)} autoComplete="street-address" rows={3} maxLength={300} required />
              <label htmlFor="driving-license" style={{ marginTop: 15 }}>Driving licence number</label>
              <input id="driving-license" value={drivingLicenseNumber} onChange={e => setDrivingLicenseNumber(e.target.value.toUpperCase())} autoComplete="off" maxLength={32} required />
              <div className="form-section-rule" />
              <h2>4. Your vehicle details</h2>
              <label htmlFor="vehicle-make">Car make</label>
              <input id="vehicle-make" value={vehicleMake} onChange={e => setVehicleMake(e.target.value)} placeholder="e.g. Ford" maxLength={60} required />
              <label htmlFor="vehicle-model" style={{ marginTop: 15 }}>Car model</label>
              <input id="vehicle-model" value={vehicleModel} onChange={e => setVehicleModel(e.target.value)} placeholder="e.g. Fiesta" maxLength={60} required />
              <label htmlFor="vehicle-colour" style={{ marginTop: 15 }}>Car colour</label>
              <input id="vehicle-colour" value={vehicleColour} onChange={e => setVehicleColour(e.target.value)} placeholder="e.g. Blue" maxLength={40} required />
              <label htmlFor="fuel-type" style={{ marginTop: 15 }}>Fuel type</label>
              <select id="fuel-type" value={fuelType} onChange={e => setFuelType(e.target.value)} required>
                <option value="">Choose fuel type</option>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Plug-in hybrid">Plug-in hybrid</option>
                <option value="Electric">Electric</option>
                <option value="Other">Other</option>
              </select>
              <div className="form-section-rule" />
              <h2>5. When should cover start?</h2>
              <div className="getquote-date-grid">
                <div><label htmlFor="cover-date">Start date</label><input id="cover-date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required /></div>
                <div><label htmlFor="cover-time">Start time</label><input id="cover-time" type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required /></div>
              </div>
              <button className="getquote-continue" type="submit" disabled={loading}>{loading ? "Connecting to Stripe…" : <>Continue to secure payment <span>→</span></>}</button>
              {notice && <p className="getquote-notice" role="alert">{notice}</p>}
              <p className="getquote-privacy">Your payment is processed securely by Stripe.</p>
            </form>
            <aside className="getquote-summary">
              <span className="summary-kicker">YOUR SELECTED COVER</span>
              <h2>Fully comprehensive</h2>
              <p>Temporary car insurance</p>
              <div className="summary-price"><strong>£{price}</strong><span>/{plan === "daily" ? "day" : plan === "weekly" ? "week" : "month"}</span></div>
              <ul><li>Fixed price for any car</li><li>Fixed price for any driver age</li><li>Simple online checkout</li></ul>
              <div className="summary-note">You’ll review your order and pay securely through Stripe Checkout.</div>
            </aside>
          </div>
          <Link className="pricing-back" href="/">← Back to GoShorty</Link>
        </div>
      </section>
    </main>
  );
}


export default function GetAQuotePage() {
  return (
    <Suspense fallback={<main className="getquote-page"><div className="container">Loading quote form…</div></main>}>
      <GetAQuoteForm />
    </Suspense>
  );
}
