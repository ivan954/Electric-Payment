import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Loader from "./components/Loader";
import { Container } from "react-bootstrap";
import LoginScreen from "./screens/LoginScreen";
import ManageScreen from "./screens/ManageScreen";
import CreateScreen from "./screens/CreateScreen";
import UpdateScreen from "./screens/UpdateScreen";
import { useAuth } from "./contexts/AuthContext";

const RequireAuth = ({ children }) => {
  const { user, ready } = useAuth();
  if (!ready) return <Loader />;
  return user ? children : <Navigate to="/" />;
};

function App() {
  return (
    <Router>
      <Header />
      <main className="py-3">
        <Container>
          <Routes>
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/" element={<ManageScreen />} />
            <Route
              path="/create"
              element={
                <RequireAuth>
                  <CreateScreen />
                </RequireAuth>
              }
            />
            <Route
              path="/manage/:id"
              element={
                <RequireAuth>
                  <UpdateScreen />
                </RequireAuth>
              }
            />
          </Routes>
        </Container>
      </main>
      <Footer />
    </Router>
  );
}

export default App;
