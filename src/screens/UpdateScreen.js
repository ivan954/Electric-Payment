import moment from "moment";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Container, Form } from "react-bootstrap";
import FormContainer from "../components/FormContainer";
import Loader from "../components/Loader";
import Message from "../components/Message";
import { useNavigate, useParams } from "react-router-dom";
import {
  getKWH,
  PaymentDetails,
  updatePayment,
} from "../actions/electricActions";
import {
  PAYMENT_UPDATE_RESET,
  PAYMENT_LIST_RESET,
  KWH_RESET,
} from "../constants/electricConstants";
import { useI18n } from "../contexts/I18nContext";

const UpdateScreen = () => {
  const [KWH, setKwh] = useState(0);
  const [date, setDate] = useState();
  const [deleteDate, setDeleteDate] = useState(false);
  const [image, setImage] = useState();
  const [paid, setPaid] = useState("");
  const [price, setPrice] = useState(0);
  const [file, setFile] = useState();

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
        <h1>{t("updatePaymentTitle")}</h1>

        <Form onSubmit={createProductHandler}>
          <br />
          <Form.Group controlId="catalogNumber">
            <Form.Label>{t("isPaidQ")} </Form.Label>
            <Form.Control
              type="text"
              min={0}
              placeholder={t("isPaidPlaceholder")}
              value={paid ?? ""}
              onChange={(e) => setPaid(e.target.value)}
            ></Form.Control>
          </Form.Group>

          <br />
          <Form.Group controlId="KWH">
            <Form.Label>{t("kwh")}</Form.Label>
            <Form.Control
              type="number"
              placeholder={t("enterKwh")}
              min={0}
              value={KWH ?? 0}
              onChange={(e) => {
                setKwh(e.target.value);
              }}
            ></Form.Control>
          </Form.Group>

          <br />
          <Form.Group controlId="Data">
            <Form.Label>{t("date")}</Form.Label>
            <Form.Control
              type="date"
              value={date ?? ""}
              onChange={(e) => {
                setDate(e.target.value);
              }}
            ></Form.Control>

            <br />
            <Form.Group controlId="image">
              <Form.Label>{t("image")}</Form.Label>
              <Form.Control
                type="file"
                placeholder={t("image")}
                onChange={(e) => {
                  setFile(e.target.files[0]);
                }}
              ></Form.Control>
            </Form.Group>

            <br />
            <Form.Group controlId="price">
              <Form.Label>{t("price")}</Form.Label>
              <Form.Control
                type="number"
                disabled
                placeholder={t("enterPrice")}
                value={price ?? 0}
              ></Form.Control>
            </Form.Group>
          </Form.Group>
          <br />

          <Button className="me-5" type="submit" variant="primary">
            {t("update")}
          </Button>
          <Button
            onClick={() => {
              if (window.confirm(t("confirmCancel"))) {
                navigate("/manage");
              }
            }}
            className="btn btn-dark my-3"
          >
            {t("cancel")}
          </Button>
        </Form>
      </FormContainer>
      {loadingUpdate && <Loader />}
      {errorUpdate && <Message variant="danger">{errorUpdate}</Message>}
    </Container>
  );
};

export default UpdateScreen;
