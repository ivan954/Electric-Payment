import React from "react";
import { Container, Row, Col } from "react-bootstrap";

const FormContainer = ({ children }) => {
  return (
    <Container>
      <Row className="justify-content-md-center">
        <Col xs={12} md={6}>
          <div className="form-card shadow-sm">{children}</div>
        </Col>
      </Row>
    </Container>
  );
};

export default FormContainer;
