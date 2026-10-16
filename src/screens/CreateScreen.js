import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Button,
  Container,
  Form,
  InputGroup,
  Modal,
  ProgressBar,
} from "react-bootstrap";
import FormContainer from "../components/FormContainer";
import Loader from "../components/Loader";
import Message from "../components/Message";
import { useNavigate } from "react-router-dom";
import {
  PAYMENT_CREATE_RESET,
  KWH_RESET,
} from "../constants/electricConstants";
import { createPayment, getKWH } from "../actions/electricActions";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "../firebase";
import { useI18n } from "../contexts/I18nContext";
import {
  PRICE_PER_KWH,
  formatCurrency,
  formatNumber,
  todayISO,
} from "../utils/payments";

const CreateScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t, lang, dir } = useI18n();

  const [paid, setPaid] = useState("No");
  const [date, setDate] = useState(todayISO);
  const [readingInput, setReadingInput] = useState("");
  const [currentReading, setCurrentReading] = useState(0);

  const [preview, setPreview] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const [submitted, setSubmitted] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const unsavedUploadPath = useRef(null);

  const { data: kwhSummary } = useSelector((state) => state.electricKWH);
  const {
    loading: loadingCreate,
    error: errorCreate,
    success: successCreate,
  } = useSelector((state) => state.electricCreate);

  useEffect(() => {
    dispatch(getKWH());
  }, [dispatch]);

  useEffect(() => {
    if (kwhSummary && kwhSummary.length > 0) {
      setCurrentReading(kwhSummary[0]);
    }
  }, [kwhSummary]);

  useEffect(() => {
    if (successCreate) {
      unsavedUploadPath.current = null;
      dispatch({ type: PAYMENT_CREATE_RESET });
      dispatch({ type: KWH_RESET });
      navigate("/");
    }
  }, [dispatch, successCreate, navigate]);

  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  const deleteUnsavedUpload = () => {
    if (unsavedUploadPath.current) {
      deleteObject(ref(storage, unsavedUploadPath.current)).catch(() => {});
      unsavedUploadPath.current = null;
    }
  };

  const uploadPhoto = (file) => {
    if (!file) return;
    deleteUnsavedUpload();
    setPreview(URL.createObjectURL(file));
    setImageUrl(null);
    setUploadError(null);
    setUploading(true);
    setProgress(0);

    const storagePath = `${Date.now()}${file.name}`;
    const uploadTask = uploadBytesResumable(ref(storage, storagePath), file);
    uploadTask.on(
      "state_changed",
      (snapshot) =>
        setProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100),
      () => {
        setUploading(false);
        setUploadError(t("uploadFailed"));
      },
      async () => {
        unsavedUploadPath.current = storagePath;
        setImageUrl(await getDownloadURL(uploadTask.snapshot.ref));
        setUploading(false);
      }
    );
  };

  const newReading = parseFloat(readingInput);
  const usage = Number.isFinite(newReading) ? newReading - currentReading : 0;
  const isReadingInvalid = readingInput !== "" && usage <= 0;
  const price = usage > 0 ? usage * PRICE_PER_KWH : 0;

  const submitHandler = (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (!Number.isFinite(newReading) || usage <= 0 || !imageUrl || !date)
      return;
    dispatch(createPayment(newReading, date, price, paid, imageUrl));
  };

  const leave = () => {
    deleteUnsavedUpload();
    setShowCancelModal(false);
    navigate("/");
  };

  return (
    <Container dir={dir}>
      <FormContainer>
        <div className="form-hero">
          <i className="bi bi-plus-circle form-hero-icon"></i>
          <h1 className="m-0">{t("createPayment")}</h1>
        </div>

        {loadingCreate ? (
          <Loader />
        ) : (
          <Form noValidate onSubmit={submitHandler}>
            <div className="form-grid">
              <div>
                <Form.Group controlId="reading" className="mb-3">
                  <Form.Label>{t("newReading")}</Form.Label>
                  <InputGroup className="input-icon-group" hasValidation>
                    <InputGroup.Text>
                      <i className="bi bi-lightning-charge"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step="any"
                      autoFocus
                      placeholder={formatNumber(currentReading, lang)}
                      value={readingInput}
                      isInvalid={
                        isReadingInvalid || (submitted && readingInput === "")
                      }
                      onChange={(e) => setReadingInput(e.target.value)}
                    />
                    <Form.Control.Feedback type="invalid">
                      {t("kwhMustBeHigher")} (
                      {formatNumber(currentReading, lang)})
                    </Form.Control.Feedback>
                  </InputGroup>
                  <Form.Text muted>
                    {t("currentKwh")}: {formatNumber(currentReading, lang)}
                  </Form.Text>
                </Form.Group>

                <div className={`live-calc ${usage > 0 ? "is-ready" : ""}`}>
                  <span>
                    {t("charged")}{" "}
                    <strong>
                      {usage > 0 ? `+${formatNumber(usage, lang)}` : "—"}{" "}
                      {t("kwhUnit")}
                    </strong>
                    {" × "}
                    {formatCurrency(PRICE_PER_KWH, lang)}
                  </span>
                  <span className="live-calc__total">
                    {formatCurrency(price, lang)}
                  </span>
                </div>

                <Form.Group controlId="date" className="mb-3">
                  <Form.Label>{t("date")}</Form.Label>
                  <InputGroup className="input-icon-group">
                    <InputGroup.Text>
                      <i className="bi bi-calendar3"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="date"
                      value={date}
                      max={todayISO()}
                      isInvalid={submitted && !date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>{t("isPaidQ")}</Form.Label>
                  <div className="segmented" role="radiogroup">
                    {["No", "Yes"].map((value) => (
                      <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={paid === value}
                        className={paid === value ? "is-active" : ""}
                        onClick={() => setPaid(value)}
                      >
                        {value === "Yes" ? t("statusPaid") : t("statusUnpaid")}
                      </button>
                    ))}
                  </div>
                </Form.Group>
              </div>

              <div>
                <Form.Label>{t("meterPhoto")}</Form.Label>
                <div
                  className={`photo-drop ${
                    submitted && !imageUrl && !uploading ? "is-invalid" : ""
                  }`}
                >
                  {preview ? (
                    <img src={preview} alt="" className="photo-drop__preview" />
                  ) : (
                    <i
                      className="bi bi-camera photo-drop__icon"
                      aria-hidden="true"
                    ></i>
                  )}
                  <div className="photo-drop__buttons">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => cameraInputRef.current.click()}
                    >
                      <i className="bi bi-camera" aria-hidden="true"></i>{" "}
                      {t("takePhoto")}
                    </Button>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => galleryInputRef.current.click()}
                    >
                      <i className="bi bi-image" aria-hidden="true"></i>{" "}
                      {t("chooseFromGallery")}
                    </Button>
                  </div>
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    hidden
                    onChange={(e) => uploadPhoto(e.target.files[0])}
                  />
                  <input
                    ref={galleryInputRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => uploadPhoto(e.target.files[0])}
                  />
                  {uploading && (
                    <ProgressBar
                      now={progress}
                      label={`${progress.toFixed(0)}%`}
                      className="w-100"
                    />
                  )}
                  {imageUrl && !uploading && (
                    <small className="text-success">
                      <i className="bi bi-check-circle" aria-hidden="true"></i>{" "}
                      {t("photoUploaded")}
                    </small>
                  )}
                  {uploadError && (
                    <small className="text-danger">{uploadError}</small>
                  )}
                  {submitted && !imageUrl && !uploading && !uploadError && (
                    <small className="text-danger">{t("photoRequired")}</small>
                  )}
                </div>
              </div>
            </div>

            {errorCreate && <Message variant="danger">{errorCreate}</Message>}
            <div className="form-actions d-flex justify-content-center gap-3 mt-4">
              <Button
                type="submit"
                variant="success"
                className="px-4 rounded"
                disabled={uploading}
              >
                {uploading ? t("uploading") : t("create")}
              </Button>
              <Button
                onClick={() => setShowCancelModal(true)}
                variant="outline-secondary"
                className="px-4 rounded"
              >
                {t("cancel")}
              </Button>
            </div>
          </Form>
        )}
      </FormContainer>

      <Modal
        show={showCancelModal}
        onHide={() => setShowCancelModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{t("confirmLeaveTitle")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{t("confirmLeaveBody")}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
            {t("stay")}
          </Button>
          <Button variant="danger" onClick={leave}>
            {t("leave")}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CreateScreen;
