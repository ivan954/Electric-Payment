// Shared helpers for payment records ({ id, KWH, date: "YYYY-MM-DD", price, paid, image })

export const PRICE_PER_KWH = 0.57;

export const isPaid = (payment) =>
  /^(yes|true|כן)$/i.test(String(payment.paid).trim());

export const todayISO = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const formatDate = (iso) => {
  if (!iso) return "";
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
};

const localeFor = (lang) => (lang === "he" ? "he-IL" : "en-IL");

export const formatCurrency = (value, lang) =>
  new Intl.NumberFormat(localeFor(lang), {
    style: "currency",
    currency: "ILS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

export const formatNumber = (value, lang) =>
  new Intl.NumberFormat(localeFor(lang), { maximumFractionDigits: 1 }).format(
    Number(value) || 0
  );

export const formatMonth = (monthKey, lang, style = "long") => {
  const [year, month] = monthKey.split("-").map(Number);
  const options =
    style === "long" ? { month: "long", year: "numeric" } : { month: "short" };
  return new Intl.DateTimeFormat(localeFor(lang), options).format(
    new Date(year, month - 1, 1)
  );
};

export const monthKeyOf = (iso) => (iso ? iso.slice(0, 7) : "");

// Newest first, each record annotated with the kWh charged since the previous reading
export const withUsage = (payments) => {
  const ascending = [...payments].sort((a, b) =>
    a.date === b.date ? a.KWH - b.KWH : a.date < b.date ? -1 : 1
  );
  return ascending
    .map((payment, i) => ({
      ...payment,
      usage: i > 0 ? payment.KWH - ascending[i - 1].KWH : null,
    }))
    .reverse();
};

export const SORT_OPTIONS = [
  "date_desc",
  "date_asc",
  "price_desc",
  "price_asc",
  "usage_desc",
];

export const DEFAULT_FILTERS = {
  q: "",
  status: "all",
  year: "all",
  sort: "date_desc",
};

const normalize = (text) =>
  String(text).toLowerCase().replace(/[₪,]/g, "").replace(/\s+/g, " ").trim();

// Everything a person might type to find a payment: dates, month names, amounts, status
const searchText = (payment, lang, statusLabel) =>
  normalize(
    [
      payment.date,
      formatDate(payment.date),
      formatMonth(monthKeyOf(payment.date), lang),
      Number(payment.price).toFixed(2),
      payment.KWH,
      payment.usage ?? "",
      statusLabel,
    ].join(" ")
  );

const comparators = {
  date_desc: (a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.KWH - a.KWH),
  date_asc: (a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.KWH - b.KWH),
  price_desc: (a, b) => b.price - a.price,
  price_asc: (a, b) => a.price - b.price,
  usage_desc: (a, b) => (b.usage ?? -1) - (a.usage ?? -1),
};

export const isDateSort = (sort) => sort.startsWith("date_");

// `payments` should come from withUsage(); `statusLabel(paid)` gives the visible status text
export const applyFilters = (payments, filters, lang, statusLabel) => {
  const tokens = normalize(filters.q).split(" ").filter(Boolean);
  return payments
    .filter((p) => {
      if (filters.status !== "all" && (filters.status === "paid") !== isPaid(p))
        return false;
      if (filters.year !== "all" && !p.date.startsWith(filters.year)) return false;
      if (!tokens.length) return true;
      const haystack = searchText(p, lang, statusLabel(isPaid(p)));
      return tokens.every((token) => haystack.includes(token));
    })
    .sort(comparators[filters.sort] || comparators.date_desc);
};

// Consecutive runs of (already sorted) payments sharing a year
export const groupByYear = (payments) => {
  const groups = [];
  payments.forEach((payment) => {
    const key = payment.date.slice(0, 4);
    let group = groups[groups.length - 1];
    if (!group || group.key !== key) {
      group = { key, payments: [], total: 0 };
      groups.push(group);
    }
    group.payments.push(payment);
    group.total += Number(payment.price) || 0;
  });
  return groups;
};

// Cost per calendar month for the last `count` months, oldest first (empty months = 0)
export const monthlyTotals = (payments, count = 12) => {
  const totals = {};
  payments.forEach((p) => {
    const key = monthKeyOf(p.date);
    totals[key] = (totals[key] || 0) + (Number(p.price) || 0);
  });

  const now = new Date();
  const months = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    months.push({ key, total: totals[key] || 0 });
  }
  return months;
};

export const summarize = (payments) => {
  const latest = payments[0] || null; // expects newest-first input
  const unpaid = payments.filter((p) => !isPaid(p));
  const thisMonth = monthKeyOf(todayISO());
  const last12 = monthlyTotals(payments, 12);
  const activeMonths = last12.filter((m) => m.total > 0);

  return {
    latest,
    unpaidTotal: unpaid.reduce((sum, p) => sum + (Number(p.price) || 0), 0),
    unpaidIds: unpaid.map((p) => p.id),
    thisMonthTotal: payments
      .filter((p) => monthKeyOf(p.date) === thisMonth)
      .reduce((sum, p) => sum + (Number(p.price) || 0), 0),
    monthlyAverage: activeMonths.length
      ? activeMonths.reduce((sum, m) => sum + m.total, 0) / activeMonths.length
      : 0,
  };
};
