import React, { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { useI18n } from "../contexts/I18nContext";
import { formatCurrency, formatDate, formatNumber } from "../utils/payments";

const StatCard = ({ icon, label, value, sub, tone, className = "", children }) => (
  <div className={`stat-card ${tone ? `stat-card--${tone}` : ""} ${className}`}>
    <div className="stat-card__label">
      <i className={`bi ${icon}`} aria-hidden="true"></i>
      {label}
    </div>
    <div className="stat-card__value">{value}</div>
    {sub && <div className="stat-card__sub">{sub}</div>}
    {children}
  </div>
);

const SummaryCards = ({ summary, canEdit, onMarkAllPaid }) => {
  const { t, lang } = useI18n();
  const [confirming, setConfirming] = useState(false);
  const { latest, unpaidTotal, unpaidIds, thisMonthTotal, monthlyAverage } =
    summary;

  return (
    <>
      <div className="stat-grid">
        <StatCard
          icon="bi-cash-coin"
          label={t("summaryUnpaid")}
          value={formatCurrency(unpaidTotal, lang)}
          tone={unpaidIds.length ? "warning" : "good"}
          className="stat-card--hero"
          sub={
            unpaidIds.length
              ? `${unpaidIds.length} ${t("paymentsCount")}`
              : t("allPaid")
          }
        >
          {canEdit && unpaidIds.length > 0 && (
            <Button
              size="sm"
              variant="light"
              className="stat-card__action"
              onClick={() => setConfirming(true)}
            >
              <i className="bi bi-check2-all" aria-hidden="true"></i>{" "}
              {t("markAllPaid")}
            </Button>
          )}
        </StatCard>
        <StatCard
          icon="bi-speedometer2"
          label={t("summaryReading")}
          value={latest ? `${formatNumber(latest.KWH, lang)} ${t("kwhUnit")}` : "—"}
          sub={latest ? `${t("lastUpdate")} ${formatDate(latest.date)}` : null}
        />
        <StatCard
          icon="bi-calendar-month"
          label={t("summaryThisMonth")}
          value={formatCurrency(thisMonthTotal, lang)}
        />
        <StatCard
          icon="bi-graph-up"
          label={t("summaryAverage")}
          value={formatCurrency(monthlyAverage, lang)}
          sub={t("last12Months")}
        />
      </div>

      <Modal show={confirming} onHide={() => setConfirming(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{t("markAllPaid")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {t("markAllPaidConfirm")}{" "}
          <strong>
            {unpaidIds.length} {t("paymentsCount")} ·{" "}
            {formatCurrency(unpaidTotal, lang)}
          </strong>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setConfirming(false)}>
            {t("cancel")}
          </Button>
          <Button
            variant="success"
            onClick={() => {
              setConfirming(false);
              onMarkAllPaid(unpaidIds);
            }}
          >
            {t("markAllPaid")}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default SummaryCards;
