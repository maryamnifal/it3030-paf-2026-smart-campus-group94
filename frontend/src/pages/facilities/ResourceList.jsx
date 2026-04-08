import { useEffect, useState } from "react";
import { getAllResources, deleteResource, updateResourceStatus } from "../../api/resourceApi";
import { useNavigate } from "react-router-dom";

export default function ResourceList() {
    const [resources, setResources] = useState([]);
    const [filters, setFilters] = useState({ type: "", location: "", capacity: "" });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const fetchResources = async () => {
        setLoading(true);
        try {
            const activeFilters = Object.fromEntries(
                Object.entries(filters).filter(([_, v]) => v !== "")
            );
            const res = await getAllResources(activeFilters);
            setResources(res.data);
        } catch (err) {
            console.error("Error fetching resources:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResources();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this resource?")) {
            try {
                await deleteResource(id);
                fetchResources();
            } catch (err) {
                console.error("Error deleting resource:", err);
            }
        }
    };

    const handleStatusToggle = async (id, currentStatus) => {
        const newStatus = currentStatus === "ACTIVE" ? "OUT_OF_SERVICE" : "ACTIVE";
        try {
            await updateResourceStatus(id, newStatus);
            fetchResources();
        } catch (err) {
            console.error("Error updating status:", err);
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            <h1>Facilities & Assets Catalogue</h1>

            {/* Filters */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                <select
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                >
                    <option value="">All Types</option>
                    <option value="LAB">Lab</option>
                    <option value="LECTURE_HALL">Lecture Hall</option>
                    <option value="MEETING_ROOM">Meeting Room</option>
                    <option value="EQUIPMENT">Equipment</option>
                </select>

                <input
                    type="text"
                    placeholder="Filter by location"
                    value={filters.location}
                    onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                />

                <input
                    type="number"
                    placeholder="Min capacity"
                    value={filters.capacity}
                    onChange={(e) => setFilters({ ...filters, capacity: e.target.value })}
                />

                <button onClick={fetchResources}>Search</button>
                <button onClick={() => { setFilters({ type: "", location: "", capacity: "" }); fetchResources(); }}>
                    Clear
                </button>
            </div>

            {/* Add New Button */}
            <button
                onClick={() => navigate("/facilities/new")}
                style={{ marginBottom: "20px", backgroundColor: "green", color: "white", padding: "10px" }}
            >
                + Add New Resource
            </button>

            {/* Table */}
            {loading ? <p>Loading...</p> : (
                <table border="1" cellPadding="10" style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead style={{ backgroundColor: "#f0f0f0" }}>
                        <tr>
                            <th>Name</th>
                            <th>Type</th>
                            <th>Capacity</th>
                            <th>Location</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {resources.map((r) => (
                            <tr key={r.id}>
                                <td>{r.name}</td>
                                <td>{r.type}</td>
                                <td>{r.capacity}</td>
                                <td>{r.location}</td>
                                <td>
                                    <span style={{ color: r.status === "ACTIVE" ? "green" : "red" }}>
                                        {r.status}
                                    </span>
                                </td>
                                <td style={{ display: "flex", gap: "5px" }}>
                                    <button onClick={() => navigate(`/facilities/${r.id}`)}>View</button>
                                    <button onClick={() => navigate(`/facilities/edit/${r.id}`)}>Edit</button>
                                    <button onClick={() => handleStatusToggle(r.id, r.status)}>
                                        {r.status === "ACTIVE" ? "Deactivate" : "Activate"}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(r.id)}
                                        style={{ color: "red" }}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}