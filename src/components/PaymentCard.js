import React from "react";
import { Button } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
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
          <LinkContainer to={`/manage/${payment.id}`}>
            <Button variant="light" size="sm" aria-label={t("update")} title={t("update")}>
              <i className="bi bi-pencil" aria-hidden="true"></i>
            </Button>
          </LinkContainer>
          <Button
            variant="light"
            size="sm"
            className="text-danger"
            aria-label={t("delete")}
            title={t("delete")}
            onClick={() => onDelete(payment)}
          >
            <i className="bi bi-trash3" aria-hidden="true"></i>
          </Button>
        </div>
      )}
    </article>
  );
};

export default PaymentCard;
