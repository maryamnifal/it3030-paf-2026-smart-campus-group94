import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ResourceList from "./pages/facilities/ResourceList";
import ResourceForm from "./pages/facilities/ResourceForm";
import ResourceDetail from "./pages/facilities/ResourceDetail";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/facilities" />} />
                <Route path="/facilities" element={<ResourceList />} />
                <Route path="/facilities/new" element={<ResourceForm />} />
                <Route path="/facilities/edit/:id" element={<ResourceForm />} />
                <Route path="/facilities/:id" element={<ResourceDetail />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;