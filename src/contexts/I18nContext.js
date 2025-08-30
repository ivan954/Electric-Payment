import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const translations = {
  en: {
    appTitle: "Electric Payment",
    createPayment: "Create Payment",
    managePayment: "Manage Payment",
    logout: "Logout",
    login: "Login",
    kwh: "KWH",
    lastUpdate: "Last update",
    searchPlaceholder: "Search by date, paid, kWh, price...",
    image: "IMAGE",
    paidDate: "Paid Date",
    price: "Price",
    paid: "Paid",
    actions: "Actions",
    update: "UPDATE",
    delete: "DELETE",
    loginToEdit: "Login to edit",
    close: "Close",
    confirmDelete: "Are you sure?",
    // Auth/Create/Update screens
    signInTitle: "Sign In",
    emailAddress: "Email Address",
    enterEmail: "Enter email",
    password: "Password",
    enterPassword: "Enter password",
    signIn: "Sign In",
    wrongEmailOrPassword: "Wrong email or password!",
    create: "Create",
    cancel: "Cancel",
    confirmCancel: "Are you sure? The data will be lost.",
    isPaidQ: "Is Paid?",
    isPaidPlaceholder: "Is Paid",
    enterKwh: "Enter KWH",
    date: "Date",
    currentKwh: "Current kWh",
    enterPrice: "Enter price",
    updatePaymentTitle: "Update Payment",
  },
  he: {
    appTitle: "תשלום חשמל",
    createPayment: "יצירת תשלום",
    managePayment: "ניהול תשלומים",
    logout: "יציאה",
    login: "התחברות",
    kwh: 'קוט"ש',
    lastUpdate: "עדכון אחרון",
    searchPlaceholder: 'חפש לפי תאריך, שולם, קוט"ש, מחיר...',
    image: "תמונה",
    paidDate: "תאריך תשלום",
    price: "מחיר",
    paid: "שולם",
    actions: "פעולות",
    update: "עדכון",
    delete: "מחיקה",
    loginToEdit: "התחבר כדי לערוך",
    close: "סגור",
    confirmDelete: "האם אתה בטוח?",
    // Auth/Create/Update screens
    signInTitle: "התחברות",
    emailAddress: "כתובת אימייל",
    enterEmail: "הזן אימייל",
    password: "סיסמה",
    enterPassword: "הזן סיסמה",
    signIn: "התחבר",
    wrongEmailOrPassword: "אימייל או סיסמה שגויים!",
    create: "יצירה",
    cancel: "בטל",
    confirmCancel: "האם אתה בטוח? הנתונים יאבדו.",
    isPaidQ: "שולם?",
    isPaidPlaceholder: "שולם",
    enterKwh: 'הזן קוט"ש',
    date: "תאריך",
    currentKwh: 'קוט"ש נוכחי',
    enterPrice: "הזן מחיר",
    updatePaymentTitle: "עדכון תשלום",
  },
};

const langToDir = { en: "ltr", he: "rtl" };

const I18nContext = createContext({
  lang: "he",
  setLang: () => {},
  t: (key) => key,
  dir: "rtl",
});

export const I18nProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    const saved = window.localStorage.getItem("lang");
    return saved === "en" || saved === "he" ? saved : "he";
  });

  const dir = langToDir[lang] || "ltr";

  useEffect(() => {
    try {
      window.localStorage.setItem("lang", lang);
    } catch (e) {
      // non-critical persistence failure
      // eslint-disable-next-line no-unused-vars
      const _ignored = e;
    }
  }, [lang]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("dir", dir);
      document.documentElement.setAttribute("lang", lang);
    }
  }, [dir, lang]);

  const t = useMemo(() => {
    const dict = translations[lang] || translations.en;
    return (key) => dict[key] ?? key;
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t, dir }), [lang, t, dir]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => useContext(I18nContext);
