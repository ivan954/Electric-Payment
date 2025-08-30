import React from "react";
import { useDispatch } from "react-redux";
import { Container, Nav, Navbar } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { logout } from "../actions/electricActions";
import { useI18n } from "../contexts/I18nContext";
import Logo from "../assets/Logo.png";

const Header = () => {
  const dispatch = useDispatch();
  const { t, lang, setLang, dir } = useI18n();
  const userInfo = window.localStorage.getItem("userInfo");

  const logoutHandler = () => {
    dispatch(logout());
    window.localStorage.removeItem("userInfo"); // Ensure userInfo is removed
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
                height="60"
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
            <Nav.Link
              onClick={() => setLang(lang === "he" ? "en" : "he")}
              title={lang === "he" ? "English" : "עברית"}
            >
              {lang === "he" ? "EN" : "HE"}
            </Nav.Link>
            {userInfo ? (
              <>
                <LinkContainer to="/create">
                  <Nav.Link>
                    <i className="fas fa-shopping-cart"></i>{" "}
                    {t("createPayment")}
                  </Nav.Link>
                </LinkContainer>
                <LinkContainer to="/">
                  <Nav.Link>
                    <i className="fas fa-shopping-cart"></i>{" "}
                    {t("managePayment")}
                  </Nav.Link>
                </LinkContainer>
                <Nav.Link onClick={logoutHandler}>{t("logout")}</Nav.Link>
              </>
            ) : (
              <>
                <LinkContainer to="/">
                  <Nav.Link>
                    <i className="fas fa-shopping-cart"></i>{" "}
                    {t("managePayment")}
                  </Nav.Link>
                </LinkContainer>
                <LinkContainer to="/login">
                  <Nav.Link>{t("login")}</Nav.Link>
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
