import React, { useEffect, useState } from "react";
import { Button, Container, Form, InputGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import FormContainer from "../components/FormContainer";
import Loader from "../components/Loader";
import Message from "../components/Message";
import { useI18n } from "../contexts/I18nContext";
import usePricing from "../hooks/usePricing";
import { savePricing } from "../utils/pricing";

const SettingsScreen = () => {
  const navigate = useNavigate();
  const { t, lang, dir } = useI18n();
  const { pricePerKwh, updatedAt, loading } = usePricing();

  const [priceInput, setPriceInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!loading) setPriceInput(String(pricePerKwh));
  }, [loading, pricePerKwh]);

  const newPrice = parseFloat(priceInput);
  const isInvalid = !(newPrice > 0);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (isInvalid) return;
    setSaving(true);
    setError(null);
    try {
      await savePricing(newPrice);
      navigate("/");
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <Container dir={dir}>
      <FormContainer>
        <div className="form-hero">
          <i className="bi bi-gear form-hero-icon"></i>
          <h1 className="m-0">{t("settings")}</h1>
        </div>

        {loading ? (
          <Loader />
        ) : (
          <Form noValidate onSubmit={submitHandler}>
            <Form.Group controlId="pricePerKwh" className="mb-3">
              <Form.Label>{t("pricePerKwhLabel")}</Form.Label>
              <InputGroup className="input-icon-group" hasValidation>
                <InputGroup.Text>₪</InputGroup.Text>
                <Form.Control
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="any"
                  value={priceInput}
                  isInvalid={isInvalid}
                  onChange={(e) => setPriceInput(e.target.value)}
                />
                <Form.Control.Feedback type="invalid">
                  {t("pricePerKwhInvalid")}
                </Form.Control.Feedback>
              </InputGroup>
              <Form.Text muted>
                {updatedAt
                  ? `${t("lastUpdate")}: ${updatedAt.toLocaleDateString(
                      lang === "he" ? "he-IL" : "en-IL"
                    )}`
                  : t("pricePerKwhDefaultNote")}
              </Form.Text>
            </Form.Group>

            <p className="small text-muted">{t("pricePerKwhHint")}</p>

            {error && <Message variant="danger">{error}</Message>}
            <div className="form-actions d-flex justify-content-center gap-3 mt-4">
              <Button
                type="submit"
                variant="success"
                className="px-4 rounded"
                disabled={saving || isInvalid}
              >
                {t("create")}
              </Button>
              <Button
                onClick={() => navigate("/")}
                variant="outline-secondary"
                className="px-4 rounded"
              >
                {t("cancel")}
              </Button>
            </div>
          </Form>
        )}
      </FormContainer>
    </Container>
  );
};

export default SettingsScreen;
