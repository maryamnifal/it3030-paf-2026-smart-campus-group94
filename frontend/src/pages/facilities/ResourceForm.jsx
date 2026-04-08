import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createResource, getResourceById, updateResource } from "../../api/resourceApi";

export default function ResourceForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [form, setForm] = useState({
        name: "",
        type: "",
        capacity: "",
        location: "",
        status: "ACTIVE",
        description: "",
        availabilityWindows: ""
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isEdit) {
            getResourceById(id).then((res) => {
                const r = res.data;
                setForm({
                    name: r.name,
                    type: r.type,
                    capacity: r.capacity,
                    location: r.location,
                    status: r.status,
                    description: r.description || "",
                    availabilityWindows: r.availabilityWindows?.join(", ") || ""
                });
            });
        }
    }, [id]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        try {
            const payload = {
                ...form,
                capacity: parseInt(form.capacity),
                availabilityWindows: form.availabilityWindows
                    ? form.availabilityWindows.split(",").map((s) => s.trim())
                    : []
            };

            if (isEdit) {
                await updateResource(id, payload);
            } else {
                await createResource(payload);
            }
            navigate("/facilities");
        } catch (err) {
            if (err.response?.data) {
                setErrors(err.response.data);
            }
        }
    };

    return (
        <div style={{ padding: "20px", maxWidth: "600px" }}>
            <h1>{isEdit ? "Edit Resource" : "Add New Resource"}</h1>

            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <div>
                    <label>Name *</label>
                    <input name="name" value={form.name} onChange={handleChange} style={{ width: "100%" }} />
                    {errors.name && <span style={{ color: "red" }}>{errors.name}</span>}
                </div>

                <div>
                    <label>Type *</label>
                    <select name="type" value={form.type} onChange={handleChange} style={{ width: "100%" }}>
                        <option value="">Select Type</option>
                        <option value="LAB">Lab</option>
                        <option value="LECTURE_HALL">Lecture Hall</option>
                        <option value="MEETING_ROOM">Meeting Room</option>
                        <option value="EQUIPMENT">Equipment</option>
                    </select>
                    {errors.type && <span style={{ color: "red" }}>{errors.type}</span>}
                </div>

                <div>
                    <label>Capacity *</label>
                    <input type="number" name="capacity" value={form.capacity} onChange={handleChange} style={{ width: "100%" }} />
                    {errors.capacity && <span style={{ color: "red" }}>{errors.capacity}</span>}
                </div>

                <div>
                    <label>Location *</label>
                    <input name="location" value={form.location} onChange={handleChange} style={{ width: "100%" }} />
                    {errors.location && <span style={{ color: "red" }}>{errors.location}</span>}
                </div>

                <div>
                    <label>Status</label>
                    <select name="status" value={form.status} onChange={handleChange} style={{ width: "100%" }}>
                        <option value="ACTIVE">Active</option>
                        <option value="OUT_OF_SERVICE">Out of Service</option>
                    </select>
                </div>

                <div>
                    <label>Description</label>
                    <textarea name="description" value={form.description} onChange={handleChange} style={{ width: "100%" }} />
                </div>

                <div>
                    <label>Availability Windows (comma separated)</label>
                    <input
                        name="availabilityWindows"
                        value={form.availabilityWindows}
                        onChange={handleChange}
                        placeholder="MON 08:00-18:00, TUE 08:00-18:00"
                        style={{ width: "100%" }}
                    />
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                    <button
                        onClick={handleSubmit}
                        style={{ backgroundColor: "blue", color: "white", padding: "10px 20px" }}
                    >
                        {isEdit ? "Update" : "Create"}
                    </button>
                    <button onClick={() => navigate("/facilities")}>Cancel</button>
                </div>
            </div>
        </div>
    );
}