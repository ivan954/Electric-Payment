import React, { useEffect, useRef } from "react";
import { useI18n } from "../contexts/I18nContext";
import {
  DEFAULT_FILTERS,
  SORT_OPTIONS,
  formatCurrency,
} from "../utils/payments";

const STATUS_FILTERS = [
  { key: "all", icon: "bi-list-ul" },
  { key: "unpaid", icon: "bi-hourglass-split" },
  { key: "paid", icon: "bi-check-circle" },
];

const PaymentFilters = ({
  filters,
  onChange,
  years,
  statusCounts,
  resultCount,
  totalCount,
  resultTotal,
}) => {
  const { t, lang } = useI18n();
  const searchRef = useRef(null);
  const set = (patch) => onChange({ ...filters, ...patch });

  const isFiltered =
    filters.q !== DEFAULT_FILTERS.q ||
    filters.status !== DEFAULT_FILTERS.status ||
    filters.year !== DEFAULT_FILTERS.year;
  const isChanged = isFiltered || filters.sort !== DEFAULT_FILTERS.sort;

  // "/" jumps to the search box, like most web apps
  useEffect(() => {
    const onKey = (e) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName);
      if (e.key === "/" && !typing) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <section className="filter-bar" aria-label={t("filterLabel")}>
      <div className="search-box">
        <i className="bi bi-search search-box__icon" aria-hidden="true"></i>
        <input
          ref={searchRef}
          type="search"
          className="search-box__input"
          placeholder={t("searchPlaceholder")}
          aria-label={t("searchPlaceholder")}
          value={filters.q}
          onChange={(e) => set({ q: e.target.value })}
          onKeyDown={(e) => e.key === "Escape" && set({ q: "" })}
        />
        {filters.q && (
          <button
            type="button"
            className="search-box__clear"
            onClick={() => {
              set({ q: "" });
              searchRef.current?.focus();
            }}
            aria-label={t("clearSearch")}
          >
            <i className="bi bi-x-lg" aria-hidden="true"></i>
          </button>
        )}
      </div>

      <div className="filter-bar__row">
        <div
          className="segmented segmented--chips"
          role="radiogroup"
          aria-label={t("statusLabel")}
        >
          {STATUS_FILTERS.map(({ key, icon }) => (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={filters.status === key}
              className={filters.status === key ? "is-active" : ""}
              onClick={() => set({ status: key })}
            >
              <i className={`bi ${icon}`} aria-hidden="true"></i>
              {t(`filter_${key}`)}
              <span className="segmented__count">{statusCounts[key]}</span>
            </button>
          ))}
        </div>

        <div className="filter-bar__selects">
          {years.length > 1 && (
            <label className="pill-select">
              <i className="bi bi-calendar3" aria-hidden="true"></i>
              <span className="visually-hidden">{t("yearLabel")}</span>
              <select
                value={filters.year}
                onChange={(e) => set({ year: e.target.value })}
              >
                <option value="all">{t("allYears")}</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <i
                className="bi bi-chevron-down pill-select__chevron"
                aria-hidden="true"
              ></i>
            </label>
          )}
          <label className="pill-select">
            <i className="bi bi-sort-down" aria-hidden="true"></i>
            <span className="visually-hidden">{t("sortLabel")}</span>
            <select
              value={filters.sort}
              onChange={(e) => set({ sort: e.target.value })}
            >
              {SORT_OPTIONS.map((key) => (
                <option key={key} value={key}>
                  {t(`sort_${key}`)}
                </option>
              ))}
            </select>
            <i
              className="bi bi-chevron-down pill-select__chevron"
              aria-hidden="true"
            ></i>
          </label>
        </div>
      </div>

      <div className="filter-bar__summary" aria-live="polite">
        <span>
          {isFiltered
            ? `${t("showing")} ${resultCount} ${t("outOf")} ${totalCount}`
            : `${totalCount} ${t("paymentsCount")}`}
          {" · "}
          <strong>{formatCurrency(resultTotal, lang)}</strong>
        </span>
        {isChanged && (
          <button
            type="button"
            className="link-button"
            onClick={() => onChange(DEFAULT_FILTERS)}
          >
            <i className="bi bi-arrow-counterclockwise" aria-hidden="true"></i>{" "}
            {t("resetFilters")}
          </button>
        )}
      </div>
    </section>
  );
};

export default PaymentFilters;
