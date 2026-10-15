import BrandLogo from "../components/BrandLogo";
import "./globals.css";
export const viewport = { themeColor: "#183e36" };
export const metadata = {
  manifest: "/manifest.webmanifest",
  applicationName: "SastoKinBech",
  appleWebApp: {
    capable: true,
    title: "SastoKinBech",
    statusBarStyle: "default",
  },
  icons: {
    icon: [{ url: "/icons/favicon-v1.png", type: "image/png", sizes: "32x32" }],
    apple: [
      { url: "/icons/apple-touch-v1.png", sizes: "180x180", type: "image/png" },
    ],
  },
  title: "Sastokinbech | Everyday finds. Special moments.",
  description:
    "Shop the Sastokinbech saree edit. Cash on Delivery across Nepal.",
};
export default function Layout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="announcement">
          A little celebration, delivered to your door.{" "}
          <span>Cash on Delivery across Nepal ↗</span>
        </div>
        <header>
          <BrandLogo />
          <nav>
            <a href="/#collection">The collection</a>
            <a href="/#why">Our promise</a>
            <a href="/#faq">Need help?</a>
          </nav>
          <a className="text-link" href="/#collection">
            Shop the edit ↗
          </a>
        </header>
        {process.env.ORDER_DEMO_MODE === "true" &&
          process.env.NODE_ENV !== "production" && (
            <div className="demo">
              LOCAL DEMO · Orders are saved locally. Sheets and email are
              simulated.
            </div>
          )}
        {children}
        <footer>
          <BrandLogo />
          <p>
            Clothing for everyday life and moments worth celebrating.
            <br />
            Our opening collection: the saree edit.
          </p>
          <a href="mailto:pasmanjitukumar@gmail.com">
            pasmanjitukumar@gmail.com ↗
          </a>
          <small>
            © {new Date().getFullYear()} Sastokinbech · Nepal · Cash on Delivery
          </small>
        </footer>
      </body>
    </html>
  );
}
