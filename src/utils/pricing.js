import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

// Used until a price is saved in Settings (IEC household tariff incl. VAT, July 2026)
export const DEFAULT_PRICE_PER_KWH = 0.6352;

// Payments created before the price was stored on each record were billed at this rate
export const LEGACY_PRICE_PER_KWH = 0.57;

const pricingRef = doc(db, "settings", "pricing");

export const fetchPricing = async () => {
  const snapshot = await getDoc(pricingRef);
  const data = snapshot.exists() ? snapshot.data() : {};
  const price = Number(data.pricePerKwh);
  return {
    pricePerKwh: price > 0 ? price : DEFAULT_PRICE_PER_KWH,
    updatedAt: data.updatedAt ? data.updatedAt.toDate() : null,
  };
};

export const savePricing = (pricePerKwh) =>
  setDoc(pricingRef, { pricePerKwh, updatedAt: serverTimestamp() });

export const priceOfPayment = (payment) => {
  const price = Number(payment && payment.pricePerKwh);
  return price > 0 ? price : LEGACY_PRICE_PER_KWH;
};
