"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function SignInPage() {
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Online portal sign-in is not connected yet. No account has been signed in.");
  }

  return (
    <main className="portal-page">
      <header className="site-header portal-header">
        <div className="container header-inner">
          <Link className="brand" href="/" aria-label="GoShorty home">
            <img className="brand-logo" src="https://www.ballantineinsuranceni.co.uk/wp-content/uploads/goshorty-logo-master-rgb-1852px%4072ppi.jpg" alt="GoShorty" />
          </Link>
        </div>
      </header>
      <section className="portal-main">
        <div className="portal-glow" />
        <div className="portal-card">
          <p className="portal-kicker">GO SHORTY ONLINE PORTAL</p>
          <h1>Welcome back</h1>
          <p className="portal-lede">Sign in to your online account.</p>
          <form className="portal-form" onSubmit={handleSubmit}>
            <label htmlFor="portal-email">Email address</label>
            <input id="portal-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
            <label htmlFor="portal-password">Password</label>
            <input id="portal-password" name="password" type="password" autoComplete="current-password" placeholder="Enter your password" required />
            <button className="portal-submit" type="submit">Sign in <span aria-hidden="true">→</span></button>
            {message && <p className="portal-message" role="status">{message}</p>}
          </form>
          <p className="portal-note">Portal authentication is not connected in this website preview yet.</p>
          <Link className="portal-back" href="/">← Back to temporary car insurance</Link>
        </div>
      </section>
    </main>
  );
}
