"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

function supabaseBrowser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Supabase browser settings are missing.");
  return createClient(url, key);
}

export default function SignInPage() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      const supabase = supabaseBrowser();
      const { error } = await supabase.auth.signInWithPassword({
        email: String(form.get("email") || ""),
        password: String(form.get("password") || ""),
      });
      if (error) throw error;
      window.location.assign("/goshorty/account/");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to sign in.");
      setLoading(false);
    }
  }

  async function resetPassword() {
    const email = (document.getElementById("portal-email") as HTMLInputElement | null)?.value || "";
    if (!email) { setMessage("Enter your email address first."); return; }
    try {
      const supabase = supabaseBrowser();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/goshorty/set-password/`,
      });
      if (error) throw error;
      setMessage("Password reset instructions have been sent to your email.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to send reset email.");
    }
  }

  return (
    <main className="portal-page">
      <header className="site-header portal-header"><div className="container header-inner"><Link className="brand" href="/" aria-label="GoShorty home"><img className="brand-logo" src="https://www.ballantineinsuranceni.co.uk/wp-content/uploads/goshorty-logo-master-rgb-1852px%4072ppi.jpg" alt="GoShorty" /></Link></div></header>
      <section className="portal-main"><div className="portal-glow" /><div className="portal-card">
        <p className="portal-kicker">GO SHORTY ONLINE PORTAL</p><h1>Welcome back</h1><p className="portal-lede">Sign in to your online account.</p>
        <form className="portal-form" onSubmit={handleSubmit}>
          <label htmlFor="portal-email">Email address</label><input id="portal-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
          <label htmlFor="portal-password">Password</label><input id="portal-password" name="password" type="password" autoComplete="current-password" placeholder="Enter your password" required />
          <button className="portal-submit" type="submit" disabled={loading}>{loading ? "Signing in…" : <>Sign in <span aria-hidden="true">→</span></>}</button>
        </form>
        <button type="button" className="portal-back" onClick={resetPassword}>Forgotten your password?</button>
        {message && <p className="portal-message" role="status">{message}</p>}
        <Link className="portal-back" href="/">← Back to temporary car insurance</Link>
      </div></section>
    </main>
  );
}
