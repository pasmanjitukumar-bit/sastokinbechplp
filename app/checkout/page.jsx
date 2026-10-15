import { Suspense } from "react";
import Checkout from "../../components/Checkout";
export default function Page() {
  return (
    <Suspense fallback={<p>Loading checkout…</p>}>
      <Checkout />
    </Suspense>
  );
}
