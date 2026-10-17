import { useEffect, useState } from "react";
import { DEFAULT_PRICE_PER_KWH, fetchPricing } from "../utils/pricing";

const usePricing = () => {
  const [pricing, setPricing] = useState({
    pricePerKwh: DEFAULT_PRICE_PER_KWH,
    updatedAt: null,
    loading: true,
  });

  useEffect(() => {
    let active = true;
    fetchPricing()
      .then((result) => active && setPricing({ ...result, loading: false }))
      .catch(() => active && setPricing((prev) => ({ ...prev, loading: false })));
    return () => {
      active = false;
    };
  }, []);

  return pricing;
};

export default usePricing;
