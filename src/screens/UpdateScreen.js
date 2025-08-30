import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Container, Form, InputGroup } from "react-bootstrap";
import FormContainer from "../components/FormContainer";
import Loader from "../components/Loader";
import Message from "../components/Message";
import { useNavigate, useParams } from "react-router-dom";
import { PaymentDetails, updatePayment } from "../actions/electricActions";
import {
  PAYMENT_UPDATE_RESET,
  KWH_RESET,
} from "../constants/electricConstants";
import { useI18n } from "../contexts/I18nContext";

const UpdateScreen = () => {
  const [KWH, setKwh] = useState(0);
  const [date, setDate] = useState();
  const [image, setImage] = useState();
  const [paid, setPaid] = useState("");
  const [price, setPrice] = useState(0);
  const [, setFile] = useState();
  const [showCancelModal, setShowCancelModal] = useState(false);

  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t, dir } = useI18n();

  const electricDetalis = useSelector((state) => state.electricDetalis);
  const { loading, error, payment } = electricDetalis;

  const electricUpdate = useSelector((state) => state.electricUpdate);
  const {
    loading: loadingUpdate,
    error: errorUpdate,
    success: successUpdate,
  } = electricUpdate;

  const createProductHandler = (e) => {
    e.preventDefault();
    dispatch(updatePayment({ id, paid, price, KWH, date, image }));
  };

  useEffect(() => {
    if (successUpdate) {
      navigate("/manage");
      dispatch({ type: PAYMENT_UPDATE_RESET });
      dispatch({ type: KWH_RESET });
    } else if (payment.id !== id) {
      dispatch(PaymentDetails(id));
    } else {
      setPaid(payment.paid);
      setKwh(payment.KWH);
      setDate(payment.date);
      setImage(payment.image);
      setPrice(payment.price);
    }
  }, [dispatch, navigate, id, payment, successUpdate]);

  return (
    <Container dir={dir}>
      <FormContainer>
        {loading && <Loader />}
        {error && <Message variant="danger">{error}</Message>}
        <div className="form-hero">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="form-hero-icon"
            aria-hidden="true"
          >
            <path
              fill="currentColor"
              d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
            />
          </svg>
          <h1 className="m-0">{t("updatePaymentTitle")}</h1>
        </div>

        <Form onSubmit={createProductHandler}>
          <div className="form-grid">
            <div>
              <Form.Group controlId="catalogNumber">
                <Form.Label>{t("isPaidQ")} </Form.Label>
                <InputGroup className="input-icon-group">
                  <InputGroup.Text>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 16 16"
                      width="16"
                      height="16"
                    >
                      <path
                        fill="currentColor"
                        d="M13.485 1.929 6 9.414 2.515 5.929 1.1 7.343 6 12.243l8.485-8.485z"
                      />
                    </svg>
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    min={0}
                    placeholder={t("isPaidPlaceholder")}
                    value={paid ?? ""}
                    onChange={(e) => setPaid(e.target.value)}
                  />
                </InputGroup>
              </Form.Group>

              <br />
              <Form.Group controlId="KWH">
                <Form.Label>{t("kwh")}</Form.Label>
                <InputGroup className="input-icon-group">
                  <InputGroup.Text>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="16"
                      height="16"
                    >
                      <path fill="currentColor" d="M13 2L3 14h7v8l10-12h-7z" />
                    </svg>
                  </InputGroup.Text>
                  <Form.Control
                    type="number"
                    placeholder={t("enterKwh")}
                    min={0}
                    value={KWH ?? 0}
                    onChange={(e) => {
                      setKwh(e.target.value);
                    }}
                  />
                </InputGroup>
              </Form.Group>

              <br />
              <Form.Group controlId="Data">
                <Form.Label>{t("date")}</Form.Label>
                <InputGroup className="input-icon-group">
                  <InputGroup.Text>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 16 16"
                      width="16"
                      height="16"
                    >
                      <path
                        fill="currentColor"
                        d="M3 0a1 1 0 0 1 1 1v1h8V1a1 1 0 1 1 2 0v1h1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h1V1a1 1 0 0 1 1-1zM2 6v8h12V6H2z"
                      />
                    </svg>
                  </InputGroup.Text>
                  <Form.Control
                    type="date"
                    value={date ?? ""}
                    onChange={(e) => {
                      setDate(e.target.value);
                    }}
                  />
                </InputGroup>
              </Form.Group>
            </div>

            <div>
              <Form.Group controlId="image">
                <Form.Label>{t("image")}</Form.Label>
                <Form.Control
                  type="file"
                  placeholder={t("image")}
                  onChange={(e) => {
                    setFile(e.target.files[0]);
                  }}
                />
              </Form.Group>

              <br />
              <Form.Group controlId="price">
                <Form.Label>{t("price")}</Form.Label>
                <InputGroup className="input-icon-group">
                  <InputGroup.Text>₪</InputGroup.Text>
                  <Form.Control
                    type="number"
                    disabled
                    placeholder={t("enterPrice")}
                    value={price ?? 0}
                  />
                </InputGroup>
              </Form.Group>
            </div>
          </div>
          <br />

          <div className="form-actions d-flex justify-content-center gap-3">
            <Button type="submit" variant="success" className="px-4 rounded">
              {t("update")}
            </Button>
            <Button
              onClick={() => setShowCancelModal(true)}
              variant="danger"
              className="px-4 rounded"
            >
              {t("cancel")}
            </Button>
          </div>
        </Form>
      </FormContainer>
      {/* Cancel confirmation modal */}
      <div
        className="modal"
        style={{ display: showCancelModal ? "block" : "none" }}
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{t("confirmLeaveTitle")}</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowCancelModal(false)}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">{t("confirmLeaveBody")}</div>
            <div className="modal-footer">
              <Button
                variant="secondary"
                onClick={() => setShowCancelModal(false)}
              >
                {t("stay")}
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  setShowCancelModal(false);
                  navigate("/");
                }}
              >
                {t("leave")}
              </Button>
            </div>
          </div>
        </div>
      </div>
      {loadingUpdate && <Loader />}
      {errorUpdate && <Message variant="danger">{errorUpdate}</Message>}
    </Container>
  );
};

export default UpdateScreen;
