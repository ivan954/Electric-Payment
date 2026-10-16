import React from "react";
import { Link } from "react-router-dom";
import LazyImage from "./LazyImage";
import { useI18n } from "../contexts/I18nContext";
import {
  formatCurrency,
  formatDate,
  formatNumber,
  isPaid,
} from "../utils/payments";

const PaymentCard = ({ payment, canEdit, onTogglePaid, onDelete, onOpenImage }) => {
  const { t, lang } = useI18n();
  const paid = isPaid(payment);

  const status = (
    <>
      <i
        className={`bi ${paid ? "bi-check-circle-fill" : "bi-hourglass-split"}`}
        aria-hidden="true"
      ></i>
      {paid ? t("statusPaid") : t("statusUnpaid")}
    </>
  );

  return (
    <article className={`payment-card ${paid ? "is-paid" : "is-unpaid"}`}>
      <button
        type="button"
        className="payment-card__thumb"
        onClick={() => onOpenImage(payment.image)}
        aria-label={t("viewImage")}
      >
        <LazyImage src={payment.image} alt="" className="payment-card__img" />
      </button>

      <div className="payment-card__body">
        <div className="payment-card__date">{formatDate(payment.date)}</div>
        <div className="payment-card__meta">
          {payment.usage != null && (
            <span className="payment-card__usage">
              <i className="bi bi-lightning-charge-fill" aria-hidden="true"></i>
              +{formatNumber(payment.usage, lang)} {t("kwhUnit")}
            </span>
          )}
          <span className="payment-card__reading">
            {t("reading")} {formatNumber(payment.KWH, lang)}
          </span>
        </div>
      </div>

      <div className="payment-card__price">
        {formatCurrency(payment.price, lang)}
      </div>

      <div className="payment-card__status">
        {canEdit ? (
          <button
            type="button"
            className={`status-pill ${paid ? "is-paid" : "is-unpaid"}`}
            onClick={() => onTogglePaid(payment)}
            title={t("togglePaidHint")}
            aria-pressed={paid}
          >
            {status}
          </button>
        ) : (
          <span className={`status-pill ${paid ? "is-paid" : "is-unpaid"}`}>
            {status}
          </span>
        )}
      </div>

      {canEdit && (
        <div className="payment-card__actions">
          <Link
            to={`/manage/${payment.id}`}
            className="icon-btn icon-btn--edit"
            aria-label={t("update")}
            title={t("update")}
          >
            <i className="bi bi-pencil-square" aria-hidden="true"></i>
          </Link>
          <button
            type="button"
            className="icon-btn icon-btn--delete"
            aria-label={t("delete")}
            title={t("delete")}
            onClick={() => onDelete(payment)}
          >
            <i className="bi bi-trash3" aria-hidden="true"></i>
          </button>
        </div>
      )}
    </article>
  );
};

export default PaymentCard;
