import Link from "next/link";

export const metadata = {
  title: "Temporary Car Insurance Prices | GoShorty",
  description: "View proposed daily, weekly and monthly temporary car insurance price options."
};

const plans = [
  { period: "Daily", price: "£20", description: "Proposed fully comprehensive cover for one day, subject to insurer terms and eligibility." },
  { period: "Weekly", price: "£100", description: "Proposed fully comprehensive cover for seven days, subject to insurer terms and eligibility." },
  { period: "Monthly", price: "£250", description: "Proposed fully comprehensive cover for a month, subject to insurer terms and eligibility.", featured: true }
];

export default function QuotePage() {
  return (
    <main className="pricing-page">
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
      <section className="pricing-hero">
        <div className="container">
          <div className="pricing-heading">
            <span className="section-kicker">TEMPORARY CAR INSURANCE</span>
            <h1>Choose the time you need</h1>
            <p>Explore our daily, weekly and monthly price options for temporary car cover.</p>
          </div>
          <div className="pricing-grid">
            {plans.map((plan) => (
              <article className={plan.featured ? "pricing-card pricing-card-featured" : "pricing-card"} key={plan.period}>
                <h2 className="pricing-period">{plan.period}</h2>
                <p className="pricing-amount">{plan.price}</p>
                <p className="pricing-caption">Proposed {plan.period.toLowerCase()} price</p><p className="pricing-cover-label">Fully comprehensive cover</p>
                <p className="pricing-description">{plan.description}</p>
                <div className="pricing-status">Not yet available to purchase</div>
              </article>
            ))}
          </div>
          <p className="pricing-disclaimer"><strong>Important:</strong> These are proposed example prices and intended cover levels only, not live insurance quotes or confirmed premiums. Fully comprehensive cover is not yet available to buy through this website and no insurance cover is provided. An authorised insurance provider must confirm the cover, eligibility, prices and policy terms before launch.</p>
          <Link className="pricing-back" href="/">← Back to GoShorty</Link>
        </div>
      </section>
    </main>
  );
}
