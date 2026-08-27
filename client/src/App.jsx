import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import CandidateDashboard from "./pages/CandidateDashboard";
import HRDashboard from "./pages/HRDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={<Navigate to="/login" />}
        />

        <Route
          path="/login"
          element={<Login />}
        />
        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/candidate"
          element={<CandidateDashboard />}
        />

        <Route
          path="/hr"
          element={<HRDashboard />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;