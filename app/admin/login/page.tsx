"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

function supabaseBrowser() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
}

export default function AdminLoginPage() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const { error } = await supabaseBrowser().auth.signInWithPassword({
      email: String(form.get("email") || ""),
      password: String(form.get("password") || ""),
    });
    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }
    window.location.assign("/admin/");
  }

  return <main className="portal-page">
    <header className="site-header portal-header"><div className="container header-inner"><Link className="brand" href="/" aria-label="GoShorty home"><img className="brand-logo" src="https://www.ballantineinsuranceni.co.uk/wp-content/uploads/goshorty-logo-master-rgb-1852px%4072ppi.jpg" alt="GoShorty" /></Link></div></header>
    <section className="portal-main"><div className="portal-glow" /><div className="portal-card">
      <p className="portal-kicker">GO SHORTY ADMIN</p><h1>Admin sign in</h1><p className="portal-lede">Sign in with your authorised administrator account.</p>
      <form className="portal-form" onSubmit={submit}>
        <label htmlFor="admin-email">Email address</label><input id="admin-email" name="email" type="email" autoComplete="username" required />
        <label htmlFor="admin-password">Password</label><input id="admin-password" name="password" type="password" autoComplete="current-password" required />
        <button className="portal-submit" type="submit" disabled={loading}>{loading ? "Signing in…" : <>Sign in to admin <span aria-hidden="true">→</span></>}</button>
      </form>
      {message && <p className="portal-message" role="alert">{message}</p>}
      <Link className="portal-back" href="/">← Back to GoShorty</Link>
    </div></section>
  </main>;
}
