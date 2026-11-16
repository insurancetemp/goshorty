import Link from "next/link";

export default function PaymentSuccessPage() {
  return <main className="portal-page">
    <header className="site-header portal-header"><div className="container header-inner"><Link className="brand" href="/"><img className="brand-logo" src="https://www.ballantineinsuranceni.co.uk/wp-content/uploads/goshorty-logo-master-rgb-1852px%4072ppi.jpg" alt="GoShorty" /></Link></div></header>
    <section className="portal-main"><div className="portal-glow" /><div className="portal-card">
      <p className="portal-kicker">GO SHORTY</p><h1>Payment successful</h1><p className="portal-lede">Thank you. Your payment has been received and your order is being prepared.</p>
      <p className="portal-note">We’ll send your order confirmation and a link to set your customer account password to the email address you provided at checkout.</p>
      <Link className="portal-submit" href="/sign-in/" style={{ textDecoration: "none", marginTop: 22 }}>Go to sign in →</Link>
    </div></section>
  </main>;
}
