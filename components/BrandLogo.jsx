"use client";

import { usePathname } from "next/navigation";

export default function BrandLogo() {
  const pathname = usePathname();
  const source =
    pathname === "/checkout"
      ? "/brand/checkout-logo.png"
      : "/brand/main-logo.png";
  return (
    <a className="brand brand-image" href="/" aria-label="SastoKinBech home">
      <img src={source} width="2172" height="724" alt="SastoKinBech" />
    </a>
  );
}
