import React, { useState, useEffect } from "react";
import { Form, Button, Container } from "react-bootstrap";
import FormContainer from "../components/FormContainer";
import { useDispatch, useSelector } from "react-redux";
import Message from "../components/Message";
import Loader from "../components/Loader";
import { loginToPaiments } from "../actions/electricActions";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../contexts/I18nContext";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t, dir } = useI18n();

  const login = useSelector((state) => state.login);
  const { loading, error } = login;

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(loginToPaiments(email, password));
  };

  useEffect(() => {
    if (window.localStorage.getItem("userInfo")) {
      navigate("/");
    }
  }, []);

  return (
    <Container dir={dir}>
      <FormContainer>
        <h1>{t("signInTitle")}</h1>
        <Form onSubmit={submitHandler}>
          <Form.Group controlId="email">
            <Form.Label>{t("emailAddress")}</Form.Label>
            <Form.Control
              type="email"
              placeholder={t("enterEmail")}
              autoComplete="on"
              value={email ?? ""}
              onChange={(e) => setEmail(e.target.value)}
            ></Form.Control>
          </Form.Group>

          <Form.Group controlId="password">
            <Form.Label>{t("password")}</Form.Label>
            <Form.Control
              type="password"
              placeholder={t("enterPassword")}
              autoComplete="on"
              value={password ?? ""}
              onChange={(e) => setPassword(e.target.value)}
            ></Form.Control>
          </Form.Group>
          <br />
          <Button type="submit" variant="primary">
            {t("signIn")}
          </Button>
        </Form>
        <br />
        {error && (
          <Message variant="danger">{t("wrongEmailOrPassword")}</Message>
        )}
        {loading && <Loader />}
      </FormContainer>
    </Container>
  );
};

export default LoginScreen;
