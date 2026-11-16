"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

const durations = ["1 hour", "2 hours", "4 hours", "1 day", "2 days", "1 week", "2 weeks", "Up to 28 days"];

const faqs = [
  {
    question: "What is temporary car insurance?",
    answer:
      "Temporary car insurance is short-term cover for a specific period, rather than a traditional annual policy. The cover, eligibility and available durations depend on the insurer and policy terms."
  },
  {
    question: "How long can I insure a car for?",
    answer:
      "Short-term policies may be available for anything from an hour to several weeks. The exact options depend on the insurer, the vehicle and the driver."
  },
  {
    question: "Can I insure a car that belongs to someone else?",
    answer:
      "Some temporary policies can cover you to drive a car owned by someone else, subject to the insurer's eligibility rules and the owner's permission. Always check the policy wording before driving."
  },
  {
    question: "Will temporary insurance affect the car owner's no-claims discount?",
    answer:
      "A standalone temporary policy is separate from the owner's annual policy, but the effect of any incident depends on the policy and circumstances. Read the insurer's terms carefully."
  }
];

export default function Home() {
  const [registration, setRegistration] = useState("");
  const [message, setMessage] = useState("");

  function handleQuoteSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!registration.trim()) {
      setMessage("Please enter your vehicle registration.");
      return;
    }
    setMessage("This is a website preview. The live insurer quote connection is not set up, so no quote has been requested and no cover is in place.");
  }

  return (
    <main>
      <header className="site-header">
        <div className="container header-inner">
          <a className="brand" href="/" aria-label="GoShorty home">
            <img className="brand-logo" src="https://www.ballantineinsuranceni.co.uk/wp-content/uploads/goshorty-logo-master-rgb-1852px%4072ppi.jpg" alt="GoShorty" />
          </a>
          <Link className="header-signin" href="/sign-in/" aria-label="Sign in to the online portal">
            <svg className="signin-person" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <circle cx="12" cy="6.5" r="3.4" />
              <path d="M4.8 21v-2.1a7.2 7.2 0 0 1 14.4 0V21" />
            </svg>
            <span>Sign In</span>
          </Link>
        </div>
      </header>

      <section className="hero" id="get-a-quote">
        <div className="hero-shape hero-shape-one" />
        <div className="hero-shape hero-shape-two" />
        <div className="container hero-grid">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-line" /> TEMPORARY CAR INSURANCE</div>
            <h1>Cover for the car.<br /><span>Freedom for you.</span></h1>
            <p className="hero-lede">
              Need to borrow a car, share the driving or get behind the wheel for a little while? Explore flexible temporary car insurance for the time you need.
            </p>
            <div className="hero-points">
              <div><span className="check-icon">✓</span> Flexible short-term cover</div>
              <div><span className="check-icon">✓</span> A simple online journey</div>
              <div><span className="check-icon">✓</span> Cover options explained clearly</div>
            </div>
            <a className="text-link" href="#how-it-works">Discover how it works <span>→</span></a>
          </div>

          <div className="quote-card">
            <h2>Get Temporary Car Insurance in<br />Under 2 Minutes</h2>
            <p className="quote-subheading">Short term cover for cars</p>
            <p className="quote-intro">Flexible short-term cover from 1 hour to 28 days – without the annual commitment.</p>
            <div className="quote-divider"><span>Cover from <strong>1 hour to 28 days</strong> for your car</span></div>
            <form onSubmit={handleQuoteSubmit} noValidate>
              <label className="sr-only" htmlFor="registration">Vehicle registration</label>
              <div className="quote-action-row">
                <div className="registration-field">
                  <span className="gb-mark"><span>🇬🇧</span><small>UK</small></span>
                  <input
                    id="registration"
                    name="registration"
                    value={registration}
                    onChange={(event) => setRegistration(event.target.value.toUpperCase())}
                    placeholder="ENTER REG"
                    autoComplete="off"
                    maxLength={8}
                    required
                  />
                </div>
                <button className="quote-submit" type="submit">Get A Quote <span aria-hidden="true">➜</span></button>
              </div>
              {message && <p className="form-message" role="status">{message}</p>}
            </form>
            <Link className="quote-prices-link" href="/quote/">View daily, weekly and monthly prices <span aria-hidden="true">→</span></Link>
            <div className="quote-bottom-line" />
            <p className="quote-disclaimer">Website preview – no live quote or insurance cover is available yet.</p>
          </div>
        </div>
      </section>

      <section className="trust-band">
        <div className="container trust-grid">
          <div className="trust-item"><span className="trust-icon">◷</span><div><strong>Flexible durations</strong><small>Explore short-term options</small></div></div>
          <div className="trust-item"><span className="trust-icon">✓</span><div><strong>Simple online steps</strong><small>A clear journey from start to finish</small></div></div>
          <div className="trust-item"><span className="trust-icon">♡</span><div><strong>Support when you need it</strong><small>Helpful information along the way</small></div></div>
        </div>
      </section>

      <section className="section intro-section" id="temporary-car-insurance">
        <div className="container intro-grid">
          <div className="section-copy">
            <span className="section-kicker">A SHORT-TERM SOLUTION</span>
            <h2>Temporary car insurance that fits around you</h2>
            <p>
              Sometimes an annual policy isn&apos;t what you need. Temporary car insurance is designed for shorter periods, giving eligible drivers the option to arrange cover for a specific trip, a few days or another short-term need.
            </p>
            <p>
              Whether you&apos;re borrowing a friend&apos;s car, sharing a long journey or driving a newly purchased vehicle, the right policy can offer a more flexible alternative to changing an annual policy.
            </p>
            <a className="button button-dark" href="#get-a-quote">Start your quote <span>→</span></a>
          </div>
          <div className="feature-visual">
            <div className="feature-blob" />
            <div className="feature-card">
              <div className="feature-card-top"><span>YOUR JOURNEY</span><span className="feature-spark">✦</span></div>
              <div className="road-illustration">
                <div className="road-line" />
                <div className="road-car">🚗</div>
                <div className="road-pin">⌖</div>
              </div>
              <div className="feature-card-bottom"><strong>Ready when you are.</strong><span>Short-term car cover starts with a few details.</span></div>
            </div>
            <div className="floating-note"><span>✓</span><div><strong>On your terms</strong><small>Choose the time you need</small></div></div>
          </div>
        </div>
      </section>

      <section className="section steps-section" id="how-it-works">
        <div className="container">
          <div className="center-heading">
            <span className="section-kicker">STRAIGHTFORWARD FROM THE START</span>
            <h2>How it works</h2>
            <p>A clear route from your first details to choosing the right cover.</p>
          </div>
          <div className="steps-grid">
            <article className="step-card"><span className="step-number">01</span><div className="step-icon">⌕</div><h3>Tell us about the car</h3><p>Start with the vehicle registration and when you need the insurance to begin.</p></article>
            <article className="step-card"><span className="step-number">02</span><div className="step-icon">☷</div><h3>Share your details</h3><p>Complete the driver and vehicle information requested for an eligibility check.</p></article>
            <article className="step-card"><span className="step-number">03</span><div className="step-icon">✓</div><h3>Review your options</h3><p>Check the available quote, policy documents, price and terms before deciding.</p></article>
          </div>
        </div>
      </section>

      <section className="section reasons-section">
        <div className="container reasons-grid">
          <div>
            <span className="section-kicker">MADE FOR THE IN-BETWEEN MOMENTS</span>
            <h2>When might temporary car insurance help?</h2>
            <p className="reasons-lede">A short-term policy may be useful when your driving plans are temporary and you meet the insurer&apos;s criteria.</p>
          </div>
          <div className="reason-list">
            <div className="reason-row"><span>01</span><div><strong>Borrowing or lending a car</strong><p>Arrange separate short-term cover when you have permission to drive someone else&apos;s car.</p></div></div>
            <div className="reason-row"><span>02</span><div><strong>Sharing a long journey</strong><p>Explore cover for another eligible driver to share the driving.</p></div></div>
            <div className="reason-row"><span>03</span><div><strong>Driving a newly bought car</strong><p>Look into short-term cover for the journey home, subject to policy terms.</p></div></div>
            <div className="reason-row"><span>04</span><div><strong>A one-off trip or occasion</strong><p>Find out whether a short period of cover suits your plans.</p></div></div>
          </div>
        </div>
      </section>

      <section className="section faq-section" id="faqs">
        <div className="container faq-grid">
          <div className="faq-heading">
            <span className="section-kicker">NEED TO KNOW MORE?</span>
            <h2>Frequently asked questions</h2>
            <p>Some helpful starting points. Always read the insurer&apos;s policy wording and eligibility criteria before buying cover.</p>
            <a className="text-link" href="#contact">Still have a question? <span>→</span></a>
          </div>
          <div className="faq-list">
            {faqs.map((faq) => (
              <details className="faq-item" key={faq.question}>
                <summary>{faq.question}<span className="faq-plus">+</span></summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bottom-cta">
        <div className="container bottom-cta-inner">
          <div><span className="section-kicker">YOUR NEXT JOURNEY STARTS HERE</span><h2>Only need cover for a little while?</h2><p>Explore temporary car insurance and take the first step.</p></div>
          <a className="button button-light" href="#get-a-quote">Get started <span>→</span></a>
        </div>
      </section>

      <footer className="site-footer" id="contact">
        <div className="container footer-main">
          <div className="footer-brand-col">
            <a className="brand brand-footer" href="/" aria-label="GoShorty home"><img className="brand-logo brand-logo-inverted" src="https://warrantysolutionsgroup.co.uk/wp-content/uploads/2024/11/goshorty-logo-inverted-rgb-1852px%4072ppi.png" alt="GoShorty" /></a>
            <p>Temporary car insurance, made straightforward.</p>
          </div>
          <div className="footer-col"><strong>Explore</strong><a href="#temporary-car-insurance">Temporary car insurance</a><a href="#how-it-works">How it works</a><a href="#faqs">FAQs</a></div>
          <div className="footer-col"><strong>Information</strong><a href="#faqs">Eligibility and policy terms</a><a href="#contact">Privacy information</a><a href="#contact">Cookie information</a></div>
          <div className="footer-col"><strong>Get in touch</strong><a href="mailto:hello@goshorty.co.uk">Email GoShorty</a><span>Customer support</span></div>
        </div>
        <div className="container footer-bottom"><span>© {new Date().getFullYear()} GoShorty. All rights reserved.</span><span>Website preview — insurance products and quotes are not currently available through this rebuild.</span></div>
      </footer>
    </main>
  );
}