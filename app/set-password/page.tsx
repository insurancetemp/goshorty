"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

export default function SetPasswordPage() {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") || "");
    const confirm = String(form.get("confirm") || "");
    if (password.length < 8) { setMessage("Choose a password with at least 8 characters."); return; }
    if (password !== confirm) { setMessage("Your passwords do not match."); return; }
    setBusy(true);
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) { setMessage(error.message); setBusy(false); return; }
    window.location.assign("/goshorty/account/");
  }

  return <main className="portal-page">
    <header className="site-header portal-header"><div className="container header-inner"><Link className="brand" href="/"><img className="brand-logo" src="https://www.ballantineinsuranceni.co.uk/wp-content/uploads/goshorty-logo-master-rgb-1852px%4072ppi.jpg" alt="GoShorty" /></Link></div></header>
    <section className="portal-main"><div className="portal-glow" /><div className="portal-card">
      <p className="portal-kicker">GO SHORTY ONLINE PORTAL</p><h1>Set your password</h1><p className="portal-lede">Create a password for your customer account.</p>
      <form className="portal-form" onSubmit={submit}>
        <label htmlFor="password">New password</label><input id="password" name="password" type="password" minLength={8} autoComplete="new-password" required />
        <label htmlFor="confirm">Confirm password</label><input id="confirm" name="confirm" type="password" minLength={8} autoComplete="new-password" required />
        <button className="portal-submit" disabled={busy}>{busy ? "Saving…" : "Save password →"}</button>
      </form>
      {message && <p className="portal-message" role="status">{message}</p>}
    </div></section>
  </main>;
}
