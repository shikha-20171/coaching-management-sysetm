import { AnimatePresence, motion } from "framer-motion";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import AuthData from "./pages/AuthData";

import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";

import Students from "./pages/Students";
import Courses from "./pages/Courses";
import Batches from "./pages/Batches";
import Fees from "./pages/Fees";
import Institutes from "./pages/Institutes";
import Attendance from "./pages/Attendance";
import Tests from "./pages/Tests";
import Notifications from "./pages/Notifications";

import ProtectedRoute from "./components/ProtectedRoute";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 18, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: -14, filter: "blur(8px)" }}
        transition={{ duration: 0.28, ease: "easeOut" }}
        className="route-stage"
      >
        <Routes location={location}>
          {/* PUBLIC ROUTES */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth-data" element={<AuthData />} />

          {/* ADMIN ROUTES */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/institutes"
            element={
              <ProtectedRoute role="admin">
                <Institutes />
              </ProtectedRoute>
            }
          />

          <Route
            path="/students"
            element={
              <ProtectedRoute role="admin">
                <Students />
              </ProtectedRoute>
            }
          />

          <Route
            path="/courses"
            element={
              <ProtectedRoute role="admin">
                <Courses />
              </ProtectedRoute>
            }
          />

          <Route
            path="/batches"
            element={
              <ProtectedRoute role="admin">
                <Batches />
              </ProtectedRoute>
            }
          />

          <Route
            path="/fees"
            element={
              <ProtectedRoute role="admin">
                <Fees />
              </ProtectedRoute>
            }
          />

          {/* USER ROUTES */}
          <Route
            path="/attendance"
            element={
              <ProtectedRoute role={["admin", "staff"]}>
                <Attendance />
              </ProtectedRoute>
            }
          />

          <Route
            path="/tests"
            element={
              <ProtectedRoute role={["admin", "staff"]}>
                <Tests />
              </ProtectedRoute>
            }
          />

          <Route
            path="/notifications"
            element={
              <ProtectedRoute role={["admin", "staff"]}>
                <Notifications />
              </ProtectedRoute>
            }
          />

          <Route
            path="/user"
            element={
              <ProtectedRoute role={["student", "staff"]}>
                <UserDashboard />
              </ProtectedRoute>
            }
          />

          {/* FALLBACK */}
          <Route path="*" element={<Login />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

export default App;
