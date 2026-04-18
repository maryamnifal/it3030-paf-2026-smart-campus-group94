import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import ResourceList from "./pages/facilities/ResourceList";
import ResourceForm from "./pages/facilities/ResourceForm";
import ResourceDetail from "./pages/facilities/ResourceDetail";
import Notifications from "./pages/notifications/Notifications";
import AuthCallback from "./pages/auth/AuthCallback";
import LoginPage from "./pages/auth/LoginPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserDashboard from "./pages/user/UserDashboard";
import ProtectedRoute from "./routes/ProtectedRoute";
import BookingsPage from "./pages/Bookings/BookingsPage";
import BookingRequests from "./pages/admin/BookingRequests";
import TicketListPage from "./pages/incidents/TicketListPage";
import TicketDetailPage from "./pages/incidents/TicketDetailPage";
import CreateTicketPage from "./pages/incidents/CreateTicketPage";

function AppLayout() {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar />

      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRole="ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/user/dashboard"
            element={
              <ProtectedRoute allowedRole="USER">
                <UserDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="/facilities" element={<ResourceList />} />

          <Route
            path="/facilities/new"
            element={
              <ProtectedRoute allowedRole="ADMIN">
                <ResourceForm />
              </ProtectedRoute>
            }
          />

          <Route
            path="/facilities/edit/:id"
            element={
              <ProtectedRoute allowedRole="ADMIN">
                <ResourceForm />
              </ProtectedRoute>
            }
          />

          <Route path="/facilities/:id" element={<ResourceDetail />} />

          <Route
            path="/bookings"
            element={
              <ProtectedRoute allowedRole="USER">
                <BookingsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/bookings"
            element={
              <ProtectedRoute allowedRole="ADMIN">
                <BookingRequests />
              </ProtectedRoute>
            }
          />

          <Route
            path="/incidents"
            element={
              <ProtectedRoute>
                <TicketListPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/incidents/create"
            element={
              <ProtectedRoute>
                <CreateTicketPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/incidents/:id"
            element={
              <ProtectedRoute>
                <TicketDetailPage />
              </ProtectedRoute>
            }
          />

         <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;