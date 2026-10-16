import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import "./index.css";
import store from "./store";
import App from "./App";
import "./bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import reportWebVitals from "./reportWebVitals";
import { I18nProvider } from "./contexts/I18nContext";
import { AuthProvider } from "./contexts/AuthContext";

if (process.env.NODE_ENV === "development") {
  window.store = store;
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <AuthProvider>
      <I18nProvider>
        <App />
      </I18nProvider>
    </AuthProvider>
  </Provider>
);
reportWebVitals();
