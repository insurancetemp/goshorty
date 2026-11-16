"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const prices = { daily: 20, weekly: 100, monthly: 250 } as const;
type Plan = keyof typeof prices;

export default function GetAQuotePage() {
  const params = useSearchParams();
  const initialReg = (params.get("reg") || "").toUpperCase();
  const initialPlan = (params.get("plan") || "daily") as Plan;
  const [registration, setRegistration] = useState(initialReg);
  const [plan, setPlan] = useState<Plan>(initialPlan in prices ? initialPlan : "daily");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [notice, setNotice] = useState("");
  const price = useMemo(() => prices[plan], [plan]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!registration.trim() || !startDate || !startTime) {
      setNotice("Please complete the vehicle registration and start date and time.");
      return;
    }
    setNotice("Your details are ready for the next step. The insurer's live quote service is not connected yet, so we cannot check the vehicle, confirm eligibility or issue a quote. No cover is active.");
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
              <div className="journey-progress"><span className="journey-step-active">1 <small>Car &amp; cover</small></span><i /><span>2 <small>Driver details</small></span><i /><span>3 <small>Review</small></span></div>
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
                <label className={plan === "monthly" ? "cover-plan-option selected" : "cover-plan-option"}><input type="radio" name="plan" value="monthly" checked={plan === "monthly"} onChange={() => setPlan("monthly")} /><span><strong>Monthly</strong><small>1 month</small></span><b>£250</b></label>
              </div>
              <div className="form-section-rule" />
              <h2>3. When should cover start?</h2>
              <div className="getquote-date-grid">
                <div><label htmlFor="cover-date">Start date</label><input id="cover-date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required /></div>
                <div><label htmlFor="cover-time">Start time</label><input id="cover-time" type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required /></div>
              </div>
              <button className="getquote-continue" type="submit">Continue <span>→</span></button>
              {notice && <p className="getquote-notice" role="status">{notice}</p>}
              <p className="getquote-privacy">This preview does not send or save the information you enter.</p>
            </form>
            <aside className="getquote-summary">
              <span className="summary-kicker">YOUR SELECTED COVER</span>
              <h2>Fully comprehensive</h2>
              <p>Temporary car insurance</p>
              <div className="summary-price"><strong>£{price}</strong><span>/{plan === "daily" ? "day" : plan === "weekly" ? "week" : "month"}</span></div>
              <ul><li>Fixed price for any car</li><li>Fixed price for any driver age</li><li>No annual policy commitment</li></ul>
              <div className="summary-note">Price confirmed by the insurer. Policy purchase and cover activation are not yet available on this website.</div>
            </aside>
          </div>
          <Link className="pricing-back" href="/">← Back to GoShorty</Link>
        </div>
      </section>
    </main>
  );
}
