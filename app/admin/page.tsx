"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient, type User } from "@supabase/supabase-js";

type Order = {
  id: string;
  order_reference: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  vehicle_registration: string;
  vehicle_make: string | null;
  vehicle_model: string | null;
  vehicle_year: number | null;
  plan: string;
  amount_pence: number;
  payment_status: string;
  cover_start: string;
  cover_end: string;
  created_at: string;
};

function supabaseBrowser() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
}

const fieldStyle: React.CSSProperties = { width: "100%", minHeight: 44, border: "1px solid #dce3eb", borderRadius: 5, padding: "10px 12px", color: "#172b42", background: "#fff" };
const labelStyle: React.CSSProperties = { display: "block", margin: "14px 0 6px", fontSize: 13, fontWeight: 700, color: "#34465b" };

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const loadOrders = useCallback(async () => {
    const supabase = supabaseBrowser();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) { window.location.assign("/admin/login/"); return; }
    setUser(auth.user);
    const { data, error } = await supabase.functions.invoke("admin-portal", { body: { action: "list-orders" } });
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    setOrders(data?.orders || []);
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try { await loadOrders(); }
      catch (error) { if (active) setNotice(error instanceof Error ? error.message : "Could not load admin orders."); }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, [loadOrders, refreshKey]);

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter(order => [order.order_reference, order.customer_name, order.customer_email, order.vehicle_registration].some(value => String(value || "").toLowerCase().includes(q)));
  }, [orders, search]);

  async function createFreeOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setNotice("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const customer = Object.fromEntries(form.entries());
    customer.registration = String(customer.registration || "").trim().toUpperCase();
    customer.drivingLicenseNumber = String(customer.drivingLicenseNumber || "").trim().toUpperCase();
    try {
      const { data, error } = await supabaseBrowser().functions.invoke("admin-portal", {
        body: { action: "create-free-order", customer },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const emailMessage = data.emailSent ? "The customer confirmation and password setup email was sent." : (data.emailWarning || "The order was saved.");
      setNotice("Complimentary order " + data.order.order_reference + " created successfully. " + emailMessage);
      formElement.reset();
      setRefreshKey(value => value + 1);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not create the complimentary order.");
    } finally {
      setSaving(false);
    }
  }

  async function signOut() {
    await supabaseBrowser().auth.signOut();
    window.location.assign("/admin/login/");
  }

  return <main className="getquote-page">
    <header className="site-header"><div className="container header-inner"><Link className="brand" href="/" aria-label="GoShorty home"><img className="brand-logo" src="https://www.ballantineinsuranceni.co.uk/wp-content/uploads/goshorty-logo-master-rgb-1852px%4072ppi.jpg" alt="GoShorty" /></Link><button className="header-signin" onClick={signOut}>Sign out</button></div></header>
    <section className="getquote-shell"><div className="container getquote-container">
      <div className="getquote-heading"><span className="section-kicker">GO SHORTY ADMINISTRATION</span><h1>Admin dashboard</h1><p>{user?.email || "Manage customer accounts and orders."}</p></div>

      <section className="getquote-form" style={{ marginBottom: 28 }}>
        <h2>Create customer account &amp; complimentary order</h2>
        <p className="field-help">Create a new customer account or attach the order to an existing account. The order is recorded at £0.00 and does not open Stripe.</p>
        <form onSubmit={createFreeOrder}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0 18px" }}>
            <div><label style={labelStyle} htmlFor="customerName">Full name</label><input style={fieldStyle} id="customerName" name="customerName" required /></div>
            <div><label style={labelStyle} htmlFor="customerEmail">Email address</label><input style={fieldStyle} id="customerEmail" name="customerEmail" type="email" required /></div>
            <div><label style={labelStyle} htmlFor="customerPhone">Mobile number</label><input style={fieldStyle} id="customerPhone" name="customerPhone" type="tel" required /></div>
            <div><label style={labelStyle} htmlFor="dateOfBirth">Date of birth</label><input style={fieldStyle} id="dateOfBirth" name="dateOfBirth" type="date" required /></div>
            <div style={{ gridColumn: "1 / -1" }}><label style={labelStyle} htmlFor="address">Full address</label><textarea style={{ ...fieldStyle, minHeight: 76 }} id="address" name="address" rows={3} required /></div>
            <div><label style={labelStyle} htmlFor="drivingLicenseNumber">Driving licence number</label><input style={fieldStyle} id="drivingLicenseNumber" name="drivingLicenseNumber" required /></div>
            <div><label style={labelStyle} htmlFor="registration">Vehicle registration</label><input style={fieldStyle} id="registration" name="registration" required /></div>
            <div><label style={labelStyle} htmlFor="vehicleMake">Car make</label><input style={fieldStyle} id="vehicleMake" name="vehicleMake" required /></div>
            <div><label style={labelStyle} htmlFor="vehicleModel">Car model</label><input style={fieldStyle} id="vehicleModel" name="vehicleModel" required /></div>
            <div><label style={labelStyle} htmlFor="vehicleYear">Year of car</label><input style={fieldStyle} id="vehicleYear" name="vehicleYear" type="number" min="1886" max={new Date().getFullYear() + 1} step="1" required /></div>
            <div><label style={labelStyle} htmlFor="vehicleColour">Car colour</label><input style={fieldStyle} id="vehicleColour" name="vehicleColour" required /></div>
            <div><label style={labelStyle} htmlFor="fuelType">Fuel type</label><select style={fieldStyle} id="fuelType" name="fuelType" required><option value="">Choose fuel type</option><option>Petrol</option><option>Diesel</option><option>Hybrid</option><option>Plug-in hybrid</option><option>Electric</option><option>Other</option></select></div>
            <div><label style={labelStyle} htmlFor="plan">Cover period</label><select style={fieldStyle} id="plan" name="plan" required><option value="">Choose cover period</option><option value="daily">Daily — 1 day</option><option value="weekly">Weekly — 7 days</option><option value="monthly">Monthly — 30 days</option></select></div>
            <div><label style={labelStyle} htmlFor="coverStart">Cover start date &amp; time</label><input style={fieldStyle} id="coverStart" name="coverStart" type="datetime-local" required /></div>
          </div>
          <button className="getquote-continue" type="submit" disabled={saving} style={{ marginTop: 22 }}>{saving ? "Creating customer order…" : "Create complimentary order — £0.00"}</button>
        </form>
        {notice && <p className="getquote-notice" role="status" style={{ marginTop: 15 }}>{notice}</p>}
      </section>

      <section className="getquote-form">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 15, flexWrap: "wrap" }}><h2 style={{ margin: 0 }}>Customer orders ({orders.length})</h2><button type="button" className="pricing-choose-link" onClick={() => setRefreshKey(value => value + 1)}>Refresh orders</button></div>
        <label style={labelStyle} htmlFor="order-search">Search by customer, email, registration or order reference</label>
        <input style={fieldStyle} id="order-search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search orders…" />
        {loading && <p>Loading orders…</p>}
        {!loading && filteredOrders.length === 0 && <p className="field-help">No matching orders found.</p>}
        {filteredOrders.map(order => <article key={order.id} style={{ padding: "18px 0", borderBottom: "1px solid #ececf1" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}><strong>{order.order_reference}</strong><strong>£{(order.amount_pence / 100).toFixed(2)}</strong></div>
          <p style={{ margin: "8px 0", color: "#536174", fontSize: 13 }}>{order.customer_name} · {order.customer_email} · {order.customer_phone || ""}</p>
          <p style={{ margin: "5px 0", color: "#687386", fontSize: 12 }}>{order.plan} · {order.vehicle_registration} · {[order.vehicle_make, order.vehicle_model, order.vehicle_year].filter(Boolean).join(" ")}</p>
          <p style={{ margin: "5px 0", color: "#687386", fontSize: 12 }}>From: {new Date(order.cover_start).toLocaleString("en-GB")} · Until: {new Date(order.cover_end).toLocaleString("en-GB")}</p>
          <p style={{ margin: "8px 0 0", color: order.payment_status === "complimentary" ? "#4d2d83" : "#536174", fontSize: 12, fontWeight: 800 }}>Status: {order.payment_status}</p>
        </article>)}
      </section>
    </div></section>
  </main>;
}
