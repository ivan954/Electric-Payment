import React from "react";
import { useDispatch } from "react-redux";
import { Container, Nav, Navbar } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { logout } from "../actions/electricActions";
import { useI18n } from "../contexts/I18nContext";
import { useAuth } from "../contexts/AuthContext";
import Logo from "../assets/Logo.png";

const Header = () => {
  const dispatch = useDispatch();
  const { t, lang, setLang, dir } = useI18n();
  const { user: userInfo } = useAuth();

  const logoutHandler = () => {
    dispatch(logout());
  };

  return (
    <Navbar
      style={{ backgroundColor: "#102A41" }}
      variant="dark"
      expand="lg"
      dir={dir}
    >
      <Container>
        <div className="d-flex align-items-center justify-content-between w-100">
          <LinkContainer to="/">
            <Navbar.Brand className="d-flex align-items-center gap-2 text-nowrap">
              <img
                src={Logo}
                alt={t("appTitle")}
                height="44"
                style={{ width: "auto" }}
              />
              <span>{t("appTitle")}</span>
            </Navbar.Brand>
          </LinkContainer>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
        </div>
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav
            className={(dir === "rtl" ? "me-auto" : "ms-auto") + " text-nowrap"}
          >
            {userInfo ? (
              <>
                <LinkContainer to="/">
                  <Nav.Link>
                    <i className="bi bi-table nav-icon"></i>
                    {t("managePayment")}
                  </Nav.Link>
                </LinkContainer>
                <LinkContainer to="/create">
                  <Nav.Link>
                    <i className="bi bi-plus-circle nav-icon"></i>
                    {t("createPayment")}
                  </Nav.Link>
                </LinkContainer>
                <Nav.Link
                  onClick={() => setLang(lang === "he" ? "en" : "he")}
                  title={lang === "he" ? "English" : "עברית"}
                >
                  <i className="bi bi-translate nav-icon"></i>
                  {lang === "he" ? t("en") : t("he")}
                </Nav.Link>
                <Nav.Link onClick={logoutHandler}>
                  <i className="bi bi-box-arrow-right nav-icon"></i>
                  {t("logout")}
                </Nav.Link>
              </>
            ) : (
              <>
                <LinkContainer to="/">
                  <Nav.Link>
                    <i className="bi bi-table nav-icon"></i>
                    {t("managePayment")}
                  </Nav.Link>
                </LinkContainer>
                <Nav.Link
                  onClick={() => setLang(lang === "he" ? "en" : "he")}
                  title={lang === "he" ? "English" : "עברית"}
                >
                  <i className="bi bi-translate nav-icon"></i>
                  {lang === "he" ? t("en") : t("he")}
                </Nav.Link>
                <LinkContainer to="/login">
                  <Nav.Link>
                    <i className="bi bi-box-arrow-in-right nav-icon"></i>
                    {t("login")}
                  </Nav.Link>
                </LinkContainer>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
