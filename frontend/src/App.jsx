import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import ResourceList from "./pages/facilities/ResourceList";
import ResourceForm from "./pages/facilities/ResourceForm";
import ResourceDetail from "./pages/facilities/ResourceDetail";
<<<<<<< HEAD
import Notifications from "./pages/notifications/Notifications";
=======
import BookingsPage from "./pages/Bookings/BookingsPage";
>>>>>>> 6aad783a67947ad97e753d1ef18b870cd5e1d9d0

function App() {
  return (
    <BrowserRouter>
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/facilities" element={<ResourceList />} />
            <Route path="/facilities/new" element={<ResourceForm />} />
            <Route path="/facilities/edit/:id" element={<ResourceForm />} />
            <Route path="/facilities/:id" element={<ResourceDetail />} />
<<<<<<< HEAD
            <Route path="/bookings" element={<div style={{padding:"120px 2rem", textAlign:"center", fontFamily:"var(--font-display)", fontSize:"24px"}}>Bookings — Coming Soon</div>} />
            <Route path="/incidents" element={<div style={{padding:"120px 2rem", textAlign:"center", fontFamily:"var(--font-display)", fontSize:"24px"}}>Incidents — Coming Soon</div>} />
            <Route path="/notifications" element={<Notifications />} />
=======
<Route path="/bookings" element={<BookingsPage />} />            <Route path="/incidents" element={<div style={{padding:"120px 2rem", textAlign:"center", fontFamily:"var(--font-display)", fontSize:"24px"}}>Incidents — Coming Soon</div>} />
            <Route path="/notifications" element={<div style={{padding:"120px 2rem", textAlign:"center", fontFamily:"var(--font-display)", fontSize:"24px"}}>Notifications — Coming Soon</div>} />
>>>>>>> 6aad783a67947ad97e753d1ef18b870cd5e1d9d0
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;