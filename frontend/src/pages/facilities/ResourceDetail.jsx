import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getResourceById } from "../../api/resourceApi";

export default function ResourceDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [resource, setResource] = useState(null);

    useEffect(() => {
        getResourceById(id).then((res) => setResource(res.data));
    }, [id]);

    if (!resource) return <p>Loading...</p>;

    return (
        <div style={{ padding: "20px", maxWidth: "600px" }}>
            <h1>{resource.name}</h1>
            <table border="1" cellPadding="10" style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                    <tr><td><b>Type</b></td><td>{resource.type}</td></tr>
                    <tr><td><b>Capacity</b></td><td>{resource.capacity}</td></tr>
                    <tr><td><b>Location</b></td><td>{resource.location}</td></tr>
                    <tr><td><b>Status</b></td>
                        <td style={{ color: resource.status === "ACTIVE" ? "green" : "red" }}>
                            {resource.status}
                        </td>
                    </tr>
                    <tr><td><b>Description</b></td><td>{resource.description}</td></tr>
                    <tr><td><b>Availability</b></td><td>{resource.availabilityWindows?.join(", ")}</td></tr>
                    <tr><td><b>Created At</b></td><td>{new Date(resource.createdAt).toLocaleString()}</td></tr>
                    <tr><td><b>Updated At</b></td><td>{new Date(resource.updatedAt).toLocaleString()}</td></tr>
                </tbody>
            </table>

            <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
                <button onClick={() => navigate(`/facilities/edit/${resource.id}`)}>Edit</button>
                <button onClick={() => navigate("/facilities")}>Back to List</button>
            </div>
        </div>
    );
}