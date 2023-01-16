import React, { useEffect, useState } from "react";
import moment from "moment";
import {
  Button,
  Col,
  Container,
  FormControl,
  Row,
  Table,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { LinkContainer } from "react-router-bootstrap";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import Message from "../components/Message";
import {
  listPayments,
  deletePayment,
  getKWH,
} from "../actions/electricActions";

const ManageScreen = () => {
  const electricKWH = useSelector((state) => state.electricKWH);
  const { loading: kwhLoader, data: currentKwh } = electricKWH;

  const electricList = useSelector((state) => state.electricList);
  const { loading, error, payments } = electricList;

  const electricDelete = useSelector((state) => state.electricDelete);
  const { loading: deleteLoader, success: successDelete } = electricDelete;

  const [searchTerm, setSearchTerm] = useState("");
  const [date, setDate] = useState([]);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const deleteHandler = (id, image) => {
    if (window.confirm("Are you sure")) {
      dispatch(deletePayment(id, image));
    }
  };

  useEffect(() => {
    if (window.localStorage.getItem("userInfo") || successDelete) {
      dispatch(listPayments());
      dispatch(getKWH());
    } else {
      navigate("/");
    }
  }, [dispatch, successDelete]);

  return (
    <div>
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <Container>
          <Row>
            <Col>
              {kwhLoader ? (
                <Loader />
              ) : (
                <div>
                  <h2>KWH: {currentKwh[0]}</h2>
                  <h2>last update: {currentKwh[1]}</h2>
                </div>
              )}
            </Col>
            <Col>
              <FormControl
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                }}
                type="text"
                placeholder="Search...   date / paid / kwh "
                className="w-100 text-center border border-dark"
              />
            </Col>
          </Row>

          {deleteLoader && <Loader />}
          <Table striped bordered hover responsive className="table-sm">
            <thead>
              <tr>
                <th>IMAGE</th>
                <th>kWh</th>
                <th>paid Data</th>
                <th>Price</th>
                <th>Paid</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {payments
                .filter((val) => {
                  if (searchTerm === "") {
                    return val;
                  } else if (
                    val.date.find((d) =>
                      d.includes(searchTerm.toLocaleLowerCase())
                    ) ||
                    val.paid.includes(searchTerm.toLocaleLowerCase()) ||
                    val.KWH.includes(searchTerm.toLocaleLowerCase())
                  ) {
                    return val;
                  }
                })
                .map((payment) => (
                  <tr key={payment.id}>
                    <td>
                      <Button variant="outline-light">
                        <img
                          onClick={(e) => {
                            if (e.target.style.width === "400px") {
                              e.target.style.width = "100px";
                            } else {
                              e.target.style.width = "400px";
                            }
                          }}
                          style={{ width: "100px" }}
                          src={payment.image}
                        />
                      </Button>
                    </td>
                    <td>{payment.KWH}</td>

                    <td>
                      {moment(new Date(payment.date)).format("DD/MM/YYYY")}
                    </td>
                    <td>{payment.price.toFixed(2)}</td>
                    <td>{payment.paid}</td>
                    <td>
                      <LinkContainer to={`/manage/${payment.id}`}>
                        <Button variant="outline-info" className="btn-sm">
                          UPDATE
                        </Button>
                      </LinkContainer>{" "}
                      <Button
                        variant="outline-danger"
                        className="btn-sm"
                        onClick={() => deleteHandler(payment.id, payment.image)}
                      >
                        DELETE
                      </Button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </Table>
        </Container>
      )}
    </div>
  );
};

export default ManageScreen;
