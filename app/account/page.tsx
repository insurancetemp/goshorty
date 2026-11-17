"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient, type User } from "@supabase/supabase-js";

type Order = {
  id: string; order_reference: string; vehicle_registration: string; plan: string; customer_phone: string | null; driver_date_of_birth: string | null; customer_address: string | null; driving_license_number: string | null; vehicle_make: string | null; vehicle_model: string | null; vehicle_year: number | null; vehicle_colour: string | null; fuel_type: string | null;
  amount_pence: number; currency: string; cover_start: string; cover_end: string;
  payment_status: string; created_at: string;
};

function supabaseBrowser() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
}

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [message, setMessage] = useState("Loading your account…");
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    const supabase = supabaseBrowser();
    let active = true;
    supabase.auth.getUser().then(async ({ data, error }) => {
      if (!active) return;
      if (error || !data.user) { window.location.assign("/goshorty/sign-in/"); return; }
      setUser(data.user);
      const result = await supabase.from("orders").select("id,order_reference,vehicle_registration,plan,customer_phone,driver_date_of_birth,customer_address,driving_license_number,vehicle_make,vehicle_model,vehicle_year,vehicle_colour,fuel_type,amount_pence,currency,cover_start,cover_end,payment_status,created_at").order("created_at", { ascending: false });
      if (!active) return;
      if (result.error) setMessage(result.error.message);
      else { setOrders(result.data || []); setMessage(result.data?.length ? "" : "Your orders will appear here."); }
      setBusy(false);
    });
    return () => { active = false; };
  }, []);

  async function signOut() {
    await supabaseBrowser().auth.signOut();
    window.location.assign("/goshorty/sign-in/");
  }

  return <main className="getquote-page">
    <header className="site-header"><div className="container header-inner"><Link className="brand" href="/"><img className="brand-logo" src="https://www.ballantineinsuranceni.co.uk/wp-content/uploads/goshorty-logo-master-rgb-1852px%4072ppi.jpg" alt="GoShorty" /></Link><button className="header-signin" onClick={signOut}>Sign out</button></div></header>
    <section className="getquote-shell"><div className="container getquote-container">
      <div className="getquote-heading"><span className="section-kicker">GO SHORTY CUSTOMER PORTAL</span><h1>Your account</h1><p>{user?.email || "Your orders and documents"}</p></div>
      <div className="getquote-form">
        <h2>Your orders</h2>
        {busy && <p>{message}</p>}
        {!busy && orders.map(order => <article key={order.id} style={{ padding: "18px 0", borderBottom: "1px solid #ececf1" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}><strong>{order.order_reference}</strong><strong>£{(order.amount_pence / 100).toFixed(2)}</strong></div>
          <p style={{ margin: "9px 0", color: "#536174", fontSize: 13 }}>{order.plan.charAt(0).toUpperCase() + order.plan.slice(1)} package · {order.vehicle_registration} · {[order.vehicle_make, order.vehicle_model].filter(Boolean).join(" ")}</p>
          <p style={{ margin: "5px 0", color: "#687386", fontSize: 12 }}>From: {new Date(order.cover_start).toLocaleString("en-GB")}</p>
          <p style={{ margin: "5px 0", color: "#687386", fontSize: 12 }}>Until: {new Date(order.cover_end).toLocaleString("en-GB")}</p>
          {order.vehicle_year && <p style={{ margin: "5px 0", color: "#687386", fontSize: 12 }}>Car year: {order.vehicle_year}</p>}
          {order.driver_date_of_birth && <p style={{ margin: "5px 0", color: "#687386", fontSize: 12 }}>Driver date of birth: {order.driver_date_of_birth}</p>}
          {order.customer_phone && <p style={{ margin: "5px 0", color: "#687386", fontSize: 12 }}>Contact: {order.customer_phone}</p>}
          {order.customer_address && <p style={{ margin: "5px 0", color: "#687386", fontSize: 12 }}>Address: {order.customer_address}</p>}
          {order.driving_license_number && <p style={{ margin: "5px 0", color: "#687386", fontSize: 12 }}>Driving licence: {order.driving_license_number}</p>}
          {order.vehicle_colour && <p style={{ margin: "5px 0", color: "#687386", fontSize: 12 }}>Colour: {order.vehicle_colour}</p>}
          {order.fuel_type && <p style={{ margin: "5px 0", color: "#687386", fontSize: 12 }}>Fuel: {order.fuel_type}</p>}
          <button type="button" onClick={() => window.print()} className="pricing-choose-link">Print order document</button>
          <p style={{ margin: "9px 0 0", color: "#4d2d83", fontSize: 12, fontWeight: 800 }}>Payment: {order.payment_status}</p>
        </article>)}
        {!busy && message && <p className="getquote-notice">{message}</p>}
        <p className="field-help">Order confirmations and your order details are also sent to your email address.</p>
      </div>
    </div></section>
  </main>;
}
