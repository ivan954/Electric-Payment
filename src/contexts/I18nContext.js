import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const translations = {
  en: {
    appTitle: "EV car",
    createPayment: "Create Payment",
    managePayment: "Payment Management",
    logout: "Logout",
    login: "Login",
    kwh: "KWH",
    lastUpdate: "Last update",
    searchPlaceholder: "Search by date, month, amount or reading",
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
    confirmLeaveTitle: "Discard changes?",
    confirmLeaveBody: "Your unsaved changes will be lost.",
    stay: "Continue editing",
    leave: "Leave",
    // Auth/Create/Update screens
    signInTitle: "Sign In",
    emailAddress: "Email Address",
    enterEmail: "Enter email",
    password: "Password",
    enterPassword: "Enter password",
    signIn: "Sign In",
    wrongEmailOrPassword: "Wrong email or password!",
    create: "Save",
    cancel: "Cancel",
    confirmCancel: "Are you sure? The data will be lost.",
    isPaidQ: "Is Paid?",
    isPaidPlaceholder: "Is Paid",
    yes: "Yes",
    no: "No",
    enterKwh: "Enter KWH",
    date: "Date",
    currentKwh: "Current kWh",
    enterPrice: "Enter price",
    updatePaymentTitle: "Update Payment",
    currentImage: "Current image",
    changeImageQ: "Change image?",
    // Dashboard
    summaryUnpaid: "Unpaid",
    summaryReading: "Meter reading",
    summaryThisMonth: "This month",
    summaryAverage: "Monthly average",
    last12Months: "Last 12 months",
    paymentsCount: "payments",
    allPaid: "All paid up",
    markAllPaid: "Mark all as paid",
    markAllPaidConfirm: "Mark every unpaid payment as paid?",
    kwhUnit: "kWh",
    filterLabel: "Filter payments",
    filter_all: "All",
    filter_unpaid: "Unpaid",
    filter_paid: "Paid",
    allYears: "All years",
    clearSearch: "Clear search",
    newPayment: "New payment",
    loading: "Loading…",
    statusLabel: "Payment status",
    yearLabel: "Year",
    sortLabel: "Sort by",
    sort_date_desc: "Newest first",
    sort_date_asc: "Oldest first",
    sort_price_desc: "Highest amount",
    sort_price_asc: "Lowest amount",
    sort_usage_desc: "Most kWh charged",
    showing: "Showing",
    outOf: "of",
    resetFilters: "Reset filters",
    statusPaid: "Paid",
    statusUnpaid: "Unpaid",
    togglePaidHint: "Click to change status",
    reading: "Reading",
    viewImage: "View photo",
    noPayments: "No payments yet",
    noResults: "No payments match this filter",
    updateFailed: "Couldn't save the change. Please try again.",
    deleteTitle: "Delete payment?",
    deleteBody: "This permanently deletes the payment and its photo.",
    // Create form
    newReading: "New meter reading",
    kwhMustBeHigher: "Must be higher than the current reading",
    charged: "Charged",
    meterPhoto: "Meter photo",
    takePhoto: "Take photo",
    chooseFromGallery: "Choose from gallery",
    photoUploaded: "Photo uploaded",
    photoRequired: "Add a photo of the meter",
    uploadFailed: "Upload failed. Please try again.",
    uploading: "Uploading…",
  },
  he: {
    appTitle: "רכב חשמלי",
    createPayment: "יצירת תשלום",
    managePayment: "ניהול תשלומים",
    logout: "יציאה",
    login: "התחברות",
    kwh: 'קוט"ש',
    lastUpdate: "עדכון אחרון",
    searchPlaceholder: "חיפוש לפי תאריך, חודש, סכום או קריאה",
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
    confirmLeaveTitle: "לבטל שינויים?",
    confirmLeaveBody: "השינויים שלא נשמרו ייאבדו.",
    stay: "המשך עריכה",
    leave: "צא",
    // Auth/Create/Update screens
    signInTitle: "התחברות",
    emailAddress: "כתובת אימייל",
    enterEmail: "הזן אימייל",
    password: "סיסמה",
    enterPassword: "הזן סיסמה",
    signIn: "התחבר",
    wrongEmailOrPassword: "אימייל או סיסמה שגויים!",
    create: "שמירה",
    cancel: "בטל",
    confirmCancel: "האם אתה בטוח? הנתונים יאבדו.",
    isPaidQ: "שולם?",
    isPaidPlaceholder: "שולם",
    yes: "כן",
    no: "לא",
    enterKwh: 'הזן קוט"ש',
    date: "תאריך",
    currentKwh: 'קוט"ש נוכחי',
    enterPrice: "הזן מחיר",
    updatePaymentTitle: "עדכון תשלום",
    currentImage: "תמונה נוכחית",
    changeImageQ: "להחליף תמונה?",
    summaryUnpaid: "לא שולם",
    summaryReading: "קריאת מונה",
    summaryThisMonth: "החודש",
    summaryAverage: "ממוצע חודשי",
    last12Months: "12 חודשים אחרונים",
    paymentsCount: "תשלומים",
    allPaid: "הכול שולם",
    markAllPaid: "סמן הכול כשולם",
    markAllPaidConfirm: "לסמן את כל התשלומים הפתוחים כשולמו?",
    kwhUnit: 'קוט"ש',
    filterLabel: "סינון תשלומים",
    filter_all: "הכול",
    filter_unpaid: "לא שולם",
    filter_paid: "שולם",
    allYears: "כל השנים",
    clearSearch: "נקה חיפוש",
    newPayment: "תשלום חדש",
    loading: "טוען…",
    statusLabel: "סטטוס תשלום",
    yearLabel: "שנה",
    sortLabel: "מיון",
    sort_date_desc: "החדש ביותר",
    sort_date_asc: "הישן ביותר",
    sort_price_desc: "הסכום הגבוה",
    sort_price_asc: "הסכום הנמוך",
    sort_usage_desc: 'הכי הרבה קוט"ש',
    showing: "מציג",
    outOf: "מתוך",
    resetFilters: "איפוס סינון",
    statusPaid: "שולם",
    statusUnpaid: "לא שולם",
    togglePaidHint: "לחץ לשינוי סטטוס",
    reading: "קריאה",
    viewImage: "הצג תמונה",
    noPayments: "אין עדיין תשלומים",
    noResults: "אין תשלומים שמתאימים לסינון",
    updateFailed: "לא הצלחנו לשמור את השינוי. נסה שוב.",
    deleteTitle: "למחוק את התשלום?",
    deleteBody: "התשלום והתמונה שלו יימחקו לצמיתות.",
    // Create form
    newReading: "קריאת מונה חדשה",
    kwhMustBeHigher: "חייב להיות גבוה מהקריאה הנוכחית",
    charged: "נטען",
    meterPhoto: "תמונת מונה",
    takePhoto: "צלם",
    chooseFromGallery: "בחר מהגלריה",
    photoUploaded: "התמונה הועלתה",
    photoRequired: "הוסף תמונה של המונה",
    uploadFailed: "ההעלאה נכשלה. נסה שוב.",
    uploading: "מעלה…",
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
