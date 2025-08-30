import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Button,
  Container,
  Form,
  ProgressBar,
  InputGroup,
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
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
import { useI18n } from "../contexts/I18nContext";

const CreateScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t, dir } = useI18n();

  // Local state for input fields and operations
  const [price, setPrice] = useState(0);
  const [paid, setPaid] = useState("");
  const [date, setDate] = useState("");
  const [image, setImage] = useState(null);
  const [file, setFile] = useState(null);
  const [currentKWH, setCurrentKWH] = useState(0);
  const [KWH, setKwh] = useState(0);

  const [progressBar, setProgressBar] = useState(0);
  const [upload, setUpload] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Selectors for Redux state
  const electricKWH = useSelector((state) => state.electricKWH);
  const { data } = electricKWH;

  const electricCreate = useSelector((state) => state.electricCreate);
  const {
    loading: loadingCreate,
    error: errorCreate,
    success: successCreate,
  } = electricCreate;

  // Handler for form submission
  const createProductHandler = (e) => {
    e.preventDefault();

    if (KWH > currentKWH) {
      const name = new Date().getTime() + file.name;
      const storageRef = ref(storage, name);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgressBar(progress);
        },
        (error) => {
          console.log(error.message);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setImage(downloadURL);
            setUpload(true);
          });
        }
      );
    } else {
      alert(`kWh needs to be greater than current kWh: ${currentKWH}`);
    }
  };

  // Effect hook for fetching data and updating state
  useEffect(() => {
    dispatch(getKWH());
  }, [dispatch]);

  useEffect(() => {
    if (data && data.length > 0) {
      setCurrentKWH(data[0]);
      setKwh(data[0]); // Initialize KWH with the current KWH value
    }
  }, [data]);

  useEffect(() => {
    if (upload && file && progressBar === 100 && image) {
      dispatch(createPayment(KWH, date, price, paid, image));
      setUpload(false);
    }
  }, [dispatch, upload, file, progressBar, image, KWH, date, price, paid]);

  useEffect(() => {
    if (successCreate) {
      dispatch({ type: PAYMENT_CREATE_RESET });
      dispatch({ type: KWH_RESET });
      navigate("/");
    }
  }, [dispatch, successCreate, navigate]);

  useEffect(() => {
    // Update the price based on the difference between KWH and currentKWH
    setPrice((KWH - currentKWH) * 0.57);
  }, [KWH, currentKWH]);

  return (
    <Container dir={dir}>
      <FormContainer>
        <div className="form-hero">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="form-hero-icon"
            aria-hidden="true"
          >
            <path
              fill="currentColor"
              d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"
            />
          </svg>
          <h1 className="m-0">{t("createPayment")}</h1>
        </div>

        {loadingCreate ? (
          <Loader />
        ) : (
          <Form onSubmit={createProductHandler}>
            <div className="form-grid">
              <div>
                <Form.Group controlId="catalogNumber">
                  <Form.Label>{t("isPaidQ")}</Form.Label>
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
                      required
                      type="text"
                      min={0}
                      placeholder={t("isPaidPlaceholder")}
                      value={paid}
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
                        <path
                          fill="currentColor"
                          d="M13 2L3 14h7v8l10-12h-7z"
                        />
                      </svg>
                    </InputGroup.Text>
                    <Form.Control
                      required
                      type="number"
                      min={0}
                      value={KWH}
                      onChange={(e) => {
                        setKwh(parseFloat(e.target.value));
                      }}
                    />
                  </InputGroup>
                  <p>
                    {t("currentKwh")}: {currentKWH}
                  </p>
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
                      required
                      type="date"
                      value={date}
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
                    required
                    type="file"
                    onChange={(e) => {
                      setFile(e.target.files[0]);
                    }}
                  />
                  <ProgressBar
                    now={progressBar}
                    label={`${progressBar.toFixed(0)}%`}
                    animated
                  />
                </Form.Group>

                <br />
                <Form.Group controlId="price">
                  <Form.Label>{t("price")}</Form.Label>
                  <InputGroup className="input-icon-group">
                    <InputGroup.Text>₪</InputGroup.Text>
                    <Form.Control
                      required
                      type="number"
                      disabled
                      placeholder={t("enterPrice")}
                      value={price.toFixed(2)}
                    />
                  </InputGroup>
                </Form.Group>
              </div>
            </div>

            <br />
            {errorCreate && <Message variant="danger">{errorCreate}</Message>}
            <div className="form-actions d-flex justify-content-center gap-3">
              <Button type="submit" variant="success" className="px-4 rounded">
                {t("create")}
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
        )}
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
    </Container>
  );
};

export default CreateScreen;
