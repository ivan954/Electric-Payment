import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Container, Form, InputGroup, Modal } from "react-bootstrap";
import FormContainer from "../components/FormContainer";
import Loader from "../components/Loader";
import Message from "../components/Message";
import { useNavigate, useParams } from "react-router-dom";
import { fetchPaymentDetails, updatePayment } from "../actions/electricActions";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
import LazyImage from "../components/LazyImage";
import {
  PAYMENT_UPDATE_RESET,
  KWH_RESET,
} from "../constants/electricConstants";
import { useI18n } from "../contexts/I18nContext";
import { PRICE_PER_KWH } from "../utils/payments";

const UpdateScreen = () => {
  const [KWH, setKwh] = useState(0);
  const [date, setDate] = useState();
  const [image, setImage] = useState();
  const [paid, setPaid] = useState("");
  const [price, setPrice] = useState(0);
  const [savedPrice, setSavedPrice] = useState(0);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [changeImage, setChangeImage] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t, dir } = useI18n();

  const electricDetails = useSelector((state) => state.electricDetails);
  const { loading, error, payment } = electricDetails;

  const electricUpdate = useSelector((state) => state.electricUpdate);
  const {
    loading: loadingUpdate,
    error: errorUpdate,
    success: successUpdate,
  } = electricUpdate;

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(updatePayment({ id, paid, price, KWH, date, image }));
  };

  useEffect(() => {
    if (successUpdate) {
      navigate("/");
      dispatch({ type: PAYMENT_UPDATE_RESET });
      dispatch({ type: KWH_RESET });
    } else if (payment.id !== id) {
      dispatch(fetchPaymentDetails(id));
    } else {
      setPaid(payment.paid);
      setKwh(payment.KWH);
      setDate(payment.date);
      setImage(payment.image);
      setPrice(payment.price);
      setSavedPrice(payment.price);
    }
  }, [dispatch, navigate, id, payment, successUpdate]);

  useEffect(() => {
    setPrice((KWH - payment.KWH) * PRICE_PER_KWH + savedPrice);
  }, [KWH, payment.KWH, savedPrice]);

  return (
    <Container dir={dir}>
      <FormContainer>
        {loading && <Loader />}
        {error && <Message variant="danger">{error}</Message>}
        <div className="form-hero">
          <i className="bi bi-pencil-square form-hero-icon"></i>
          <h1 className="m-0">{t("updatePaymentTitle")}</h1>
        </div>

        <Form onSubmit={submitHandler}>
          <div className="form-grid">
            <div>
              <Form.Group controlId="paid">
                <Form.Label>{t("isPaidQ")} </Form.Label>
                <InputGroup className="input-icon-group">
                  <InputGroup.Text>
                    <i className="bi bi-check-lg"></i>
                  </InputGroup.Text>
                  <Form.Select
                    value={paid ?? ""}
                    onChange={(e) => setPaid(e.target.value)}
                  >
                    <option value="">--</option>
                    <option value="Yes">{t("yes")}</option>
                    <option value="No">{t("no")}</option>
                  </Form.Select>
                </InputGroup>
              </Form.Group>

              <br />
              <Form.Group controlId="KWH">
                <Form.Label>{t("kwh")}</Form.Label>
                <InputGroup className="input-icon-group">
                  <InputGroup.Text>
                    <i className="bi bi-lightning-charge"></i>
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
              <Form.Group controlId="date">
                <Form.Label>{t("date")}</Form.Label>
                <InputGroup className="input-icon-group">
                  <InputGroup.Text>
                    <i className="bi bi-calendar3"></i>
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
                <Form.Label>{t("currentImage")}</Form.Label>
                {image && (
                  <div className="mb-2">
                    <LazyImage
                      src={image}
                      alt="current"
                      style={{
                        maxWidth: "65%",
                        borderRadius: 6,
                        cursor: "pointer",
                      }}
                      onClick={() => setShowImageModal(true)}
                    />
                  </div>
                )}
                <Form.Check
                  type="switch"
                  id="change-image-switch"
                  label={t("changeImageQ")}
                  checked={changeImage}
                  onChange={(e) => setChangeImage(e.target.checked)}
                  className="mb-2"
                />
                {changeImage && (
                  <>
                    <Form.Control
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files && e.target.files[0];
                        if (!file) return;
                        const storagePath = `${Date.now()}${file.name}`;
                        const uploadTask = uploadBytesResumable(
                          ref(storage, storagePath),
                          file
                        );
                        setUploading(true);
                        setUploadError(null);
                        uploadTask.on(
                          "state_changed",
                          (snapshot) =>
                            setProgress(
                              (snapshot.bytesTransferred /
                                snapshot.totalBytes) *
                                100
                            ),
                          (uploadFailure) => {
                            setUploading(false);
                            setUploadError(uploadFailure.message);
                          },
                          () => {
                            getDownloadURL(uploadTask.snapshot.ref).then(
                              (downloadURL) => {
                                setImage(downloadURL);
                                setUploading(false);
                              }
                            );
                          }
                        );
                      }}
                    />
                    {uploading && (
                      <div className="mt-2 small text-muted">
                        {progress.toFixed(0)}%
                      </div>
                    )}
                    {uploadError && (
                      <Message variant="danger">{uploadError}</Message>
                    )}
                  </>
                )}
              </Form.Group>
            </div>
          </div>
          <br />

          <div className="form-actions d-flex justify-content-center gap-3">
            <Button
              type="submit"
              variant="success"
              className="px-4 rounded"
              disabled={uploading}
            >
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
      <Modal show={showImageModal} onHide={() => setShowImageModal(false)}>
        <Modal.Body className="d-flex justify-content-center">
          <LazyImage
            src={image}
            alt="payment receipt"
            className="modal-img"
            style={{ maxWidth: "100%", maxHeight: "80vh", height: "auto" }}
          />
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-center">
          <Button variant="secondary" onClick={() => setShowImageModal(false)}>
            {t("close")}
          </Button>
        </Modal.Footer>
      </Modal>
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
