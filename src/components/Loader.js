import React from "react";
import { useI18n } from "../contexts/I18nContext";
import "../index.css";

const Loader = () => {
  const { t } = useI18n();

  return (
    <div className="loader-overlay" role="status" aria-live="polite">
      <div className="loader">
        <svg className="loader__ring" viewBox="0 0 64 64" aria-hidden="true">
          <circle className="loader__track" cx="32" cy="32" r="28" />
          <circle className="loader__arc" cx="32" cy="32" r="28" />
        </svg>
        <i className="bi bi-lightning-charge-fill loader__bolt" aria-hidden="true"></i>
      </div>
      <span className="loader__label">{t("loading")}</span>
    </div>
  );
};

export default Loader;
