import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTicket, uploadAttachments } from "../../api/ticketApi";

export default function CreateTicketPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [files, setFiles] = useState([]);

  const [form, setForm] = useState({
    resourceName: "",
    category: "EQUIPMENT",
    description: "",
    priority: "MEDIUM",
    contactDetails: "",
  });

  const categories = ["EQUIPMENT", "ELECTRICAL", "CLEANING", "PLUMBING", "OTHER"];
  const priorities = ["LOW", "MEDIUM", "HIGH"];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    if (selected.length > 3) {
      setError("Maximum 3 images allowed");
      return;
    }
    setFiles(selected);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Step 1: Create the ticket
      const response = await createTicket(form);
      const ticketId = response.data.id;

      // Step 2: Upload attachments if any
      if (files.length > 0) {
        await uploadAttachments(ticketId, files);
      }

      // Step 3: Redirect to ticket list
      navigate("/incidents");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0b1220 0%, #1a2540 100%)",
      padding: "120px 2rem 60px",
      fontFamily: "var(--font-display)",
    }}>
      <div style={{
        maxWidth: "700px",
        margin: "0 auto",
      }}>
        {/* Header */}
        <div style={{ marginBottom: "40px" }}>
          <button
            onClick={() => navigate("/incidents")}
            style={{
              background: "transparent",
              border: "none",
              color: "#94a3b8",
              cursor: "pointer",
              fontSize: "14px",
              marginBottom: "16px",
              padding: 0,
            }}
          >
            ← Back to Incidents
          </button>
          <h1 style={{ color: "#fff", fontSize: "32px", fontWeight: 800, margin: 0 }}>
            Report an Incident
          </h1>
          <p style={{ color: "#94a3b8", marginTop: "8px" }}>
            Fill in the details below to submit a maintenance request
          </p>
        </div>

        {/* Form Card */}
        <div style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "20px",
          padding: "40px",
        }}>
          {error && (
            <div style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: "10px",
              padding: "12px 16px",
              color: "#f87171",
              marginBottom: "24px",
              fontSize: "14px",
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Resource/Location */}
            <div style={{ marginBottom: "24px" }}>
              <label style={{ color: "#e2e8f0", fontSize: "14px", fontWeight: 600, display: "block", marginBottom: "8px" }}>
                Resource / Location
              </label>
              <input
                type="text"
                name="resourceName"
                value={form.resourceName}
                onChange={handleChange}
                placeholder="e.g. Lab 3, Projector in Room 201"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "10px",
                  color: "#fff",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Category */}
            <div style={{ marginBottom: "24px" }}>
              <label style={{ color: "#e2e8f0", fontSize: "14px", fontWeight: 600, display: "block", marginBottom: "8px" }}>
                Category *
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background: "#1a2540",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "10px",
                  color: "#fff",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div style={{ marginBottom: "24px" }}>
              <label style={{ color: "#e2e8f0", fontSize: "14px", fontWeight: 600, display: "block", marginBottom: "8px" }}>
                Description *
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the issue in detail..."
                rows={5}
                required
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "10px",
                  color: "#fff",
                  fontSize: "14px",
                  outline: "none",
                  resize: "vertical",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Priority */}
            <div style={{ marginBottom: "24px" }}>
              <label style={{ color: "#e2e8f0", fontSize: "14px", fontWeight: 600, display: "block", marginBottom: "8px" }}>
                Priority *
              </label>
              <div style={{ display: "flex", gap: "12px" }}>
                {priorities.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setForm({ ...form, priority: p })}
                    style={{
                      flex: 1,
                      padding: "10px",
                      borderRadius: "10px",
                      border: `2px solid ${form.priority === p
                        ? p === "HIGH" ? "#ef4444"
                          : p === "MEDIUM" ? "var(--primary)"
                          : "#10b981"
                        : "rgba(255,255,255,0.12)"}`,
                      background: form.priority === p
                        ? p === "HIGH" ? "rgba(239,68,68,0.15)"
                          : p === "MEDIUM" ? "rgba(244,180,0,0.15)"
                          : "rgba(16,185,129,0.15)"
                        : "transparent",
                      color: form.priority === p
                        ? p === "HIGH" ? "#ef4444"
                          : p === "MEDIUM" ? "var(--primary)"
                          : "#10b981"
                        : "#94a3b8",
                      fontWeight: 600,
                      fontSize: "14px",
                      cursor: "pointer",
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Contact Details */}
            <div style={{ marginBottom: "24px" }}>
              <label style={{ color: "#e2e8f0", fontSize: "14px", fontWeight: 600, display: "block", marginBottom: "8px" }}>
                Contact Details *
              </label>
              <input
                type="text"
                name="contactDetails"
                value={form.contactDetails}
                onChange={handleChange}
                placeholder="e.g. Phone: 077XXXXXXX or email@example.com"
                required
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "10px",
                  color: "#fff",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Image Attachments */}
            <div style={{ marginBottom: "32px" }}>
              <label style={{ color: "#e2e8f0", fontSize: "14px", fontWeight: 600, display: "block", marginBottom: "8px" }}>
                Attachments (max 3 images)
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "10px",
                  color: "#94a3b8",
                  fontSize: "14px",
                  boxSizing: "border-box",
                }}
              />
              {files.length > 0 && (
                <p style={{ color: "#10b981", fontSize: "13px", marginTop: "8px" }}>
                  {files.length} file(s) selected
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                background: "var(--primary)",
                color: "#111827",
                fontWeight: 700,
                fontSize: "16px",
                borderRadius: "12px",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Submitting..." : "Submit Ticket"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}