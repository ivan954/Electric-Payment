import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { LinkContainer } from "react-router-bootstrap";
import { useSearchParams } from "react-router-dom";
import Loader from "../components/Loader";
import Message from "../components/Message";
import LazyImage from "../components/LazyImage";
import PaymentCard from "../components/PaymentCard";
import SummaryCards from "../components/SummaryCards";
import PaymentFilters from "../components/PaymentFilters";
import { useI18n } from "../contexts/I18nContext";
import { useAuth } from "../contexts/AuthContext";
import {
  listPayments,
  deletePayment,
  setPaymentsPaid,
} from "../actions/electricActions";
import {
  DEFAULT_FILTERS,
  SORT_OPTIONS,
  applyFilters,
  formatCurrency,
  groupByYear,
  isDateSort,
  isPaid,
  summarize,
  withUsage,
} from "../utils/payments";
import ".././index.css";

const ManageScreen = () => {
  const {
    loading,
    error,
    payments = [],
  } = useSelector((state) => state.electricList);
  const { loading: deleteLoader, success: successDelete } = useSelector(
    (state) => state.electricDelete
  );

  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedImage, setSelectedImage] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [actionError, setActionError] = useState(null);

  const dispatch = useDispatch();
  const { t, lang, dir } = useI18n();
  const { user } = useAuth();
  const canEdit = Boolean(user);

  useEffect(() => {
    dispatch(listPayments());
  }, [dispatch, successDelete]);

  // Extended "add" button: shrink to an icon while scrolling down, expand on the way up
  const [fabCompact, setFabCompact] = useState(false);
  const lastScrollY = useRef(0);
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - lastScrollY.current) < 8) return;
      setFabCompact(y > lastScrollY.current && y > 120);
      lastScrollY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const sorted = useMemo(() => withUsage(payments), [payments]);
  const summary = useMemo(() => summarize(sorted), [sorted]);

  const years = useMemo(
    () => [...new Set(sorted.map((p) => p.date.slice(0, 4)))],
    [sorted]
  );

  // Filters live in the URL so refresh / back / shared links keep them
  const filters = useMemo(() => {
    const get = (key) => searchParams.get(key) || DEFAULT_FILTERS[key];
    const sort = get("sort");
    return {
      q: get("q"),
      status: ["all", "paid", "unpaid"].includes(get("status"))
        ? get("status")
        : "all",
      year: get("year"),
      sort: SORT_OPTIONS.includes(sort) ? sort : DEFAULT_FILTERS.sort,
    };
  }, [searchParams]);

  const setFilters = (next) => {
    const params = {};
    Object.keys(DEFAULT_FILTERS).forEach((key) => {
      if (next[key] && next[key] !== DEFAULT_FILTERS[key])
        params[key] = next[key];
    });
    setSearchParams(params, { replace: true });
  };

  const statusLabel = (paid) => (paid ? t("statusPaid") : t("statusUnpaid"));

  const visible = useMemo(
    () => applyFilters(sorted, filters, lang, statusLabel),
    // statusLabel only depends on t, which changes with lang
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sorted, filters, lang]
  );

  // Status counts reflect the other active filters, so each chip previews its result
  const statusCounts = useMemo(() => {
    const base = applyFilters(
      sorted,
      { ...filters, status: "all" },
      lang,
      statusLabel
    );
    const paid = base.filter(isPaid).length;
    return { all: base.length, paid, unpaid: base.length - paid };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sorted, filters, lang]);

  const groups = useMemo(
    () =>
      isDateSort(filters.sort)
        ? groupByYear(visible)
        : [{ key: null, payments: visible }],
    [visible, filters.sort]
  );
  const visibleTotal = visible.reduce(
    (sum, p) => sum + (Number(p.price) || 0),
    0
  );

  const updatePaid = (ids, paid) => {
    setActionError(null);
    dispatch(setPaymentsPaid(ids, paid)).catch(() =>
      setActionError(t("updateFailed"))
    );
  };

  const confirmDelete = () => {
    dispatch(deletePayment(pendingDelete.id, pendingDelete.image));
    setPendingDelete(null);
  };

  if (loading) return <Loader />;
  if (error) return <Message variant="danger">{error}</Message>;

  return (
    <div dir={dir} className="manage-screen">
      <SummaryCards
        summary={summary}
        canEdit={canEdit}
        onMarkAllPaid={(ids) => updatePaid(ids, "Yes")}
      />


      {actionError && <Message variant="danger">{actionError}</Message>}

      <PaymentFilters
        filters={filters}
        onChange={setFilters}
        years={years}
        statusCounts={statusCounts}
        resultCount={visible.length}
        totalCount={sorted.length}
        resultTotal={visibleTotal}
      />

      {deleteLoader && <Loader />}

      {visible.length === 0 ? (
        <div className="empty-state">
          <i
            className={`bi ${sorted.length ? "bi-search" : "bi-inbox"}`}
            aria-hidden="true"
          ></i>
          <p>{sorted.length ? t("noResults") : t("noPayments")}</p>
          {sorted.length > 0 && (
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => setFilters(DEFAULT_FILTERS)}
            >
              {t("resetFilters")}
            </Button>
          )}
        </div>
      ) : (
        groups.map((group) => (
          <section key={group.key || "all"} className="month-group">
            {group.key && (
              <header className="month-group__header">
                <h3>{group.key}</h3>
                <span>
                  {group.payments.length} {t("paymentsCount")} ·{" "}
                  <strong>{formatCurrency(group.total, lang)}</strong>
                </span>
              </header>
            )}
            {group.payments.map((payment) => (
              <PaymentCard
                key={payment.id}
                payment={payment}
                canEdit={canEdit}
                onOpenImage={setSelectedImage}
                onDelete={setPendingDelete}
                onTogglePaid={(p) =>
                  updatePaid([p.id], isPaid(p) ? "No" : "Yes")
                }
              />
            ))}
          </section>
        ))
      )}

      {canEdit && (
        <LinkContainer to="/create">
          <Button
            className={`fab ${fabCompact ? "fab--compact" : ""}`}
            aria-label={t("createPayment")}
          >
            <span className="fab__icon" aria-hidden="true">
              <i className="bi bi-plus-lg"></i>
            </span>
            <span className="fab__label">{t("newPayment")}</span>
          </Button>
        </LinkContainer>
      )}

      <Modal
        show={Boolean(selectedImage)}
        onHide={() => setSelectedImage(null)}
        centered
      >
        <Modal.Body className="d-flex justify-content-center">
          <LazyImage
            src={selectedImage}
            alt={t("image")}
            className="modal-img"
            style={{ maxWidth: "100%", maxHeight: "80vh", height: "auto" }}
          />
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-center">
          <Button variant="secondary" onClick={() => setSelectedImage(null)}>
            {t("close")}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={Boolean(pendingDelete)}
        onHide={() => setPendingDelete(null)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{t("deleteTitle")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{t("deleteBody")}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setPendingDelete(null)}>
            {t("cancel")}
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            {t("delete")}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ManageScreen;
