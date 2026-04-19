import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createTicket, uploadAttachments } from "../../api/ticketApi";
import { getAllResources } from "../../api/resourceApi";

const pageCardStyle = {
  background: "#fff",
  border: "1px solid rgba(15,23,42,0.08)",
  borderRadius: "28px",
  boxShadow: "0 10px 30px rgba(15,23,42,0.05)",
};

const inputStyle = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "16px",
  border: "1px solid rgba(15,23,42,0.08)",
  background: "#fff",
  color: "var(--text-dark)",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
};

const labelStyle = {
  display: "block",
  fontSize: "13px",
  fontWeight: 700,
  color: "var(--text-dark)",
  marginBottom: "8px",
};

const pillStyle = {
  display: "inline-block",
  background: "var(--primary-light)",
  color: "var(--secondary)",
  fontSize: "12px",
  fontWeight: 700,
  letterSpacing: "1.2px",
  textTransform: "uppercase",
  padding: "8px 18px",
  borderRadius: "999px",
  marginBottom: "16px",
};

export default function CreateTicketPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [files, setFiles] = useState([]);

  const [resources, setResources] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedResource, setSelectedResource] = useState(null);

  const [form, setForm] = useState({
    resourceId: "",
    resourceName: "",
    category: "EQUIPMENT",
    description: "",
    priority: "MEDIUM",
    contactDetails: "",
  });

  const categories = ["EQUIPMENT", "ELECTRICAL", "CLEANING", "PLUMBING", "OTHER"];
  const priorities = ["LOW", "MEDIUM", "HIGH"];

  useEffect(() => {
    getAllResources()
      .then((res) => setResources(res.data || []))
      .catch(() => setResources([]));
  }, []);

  const locations = [...new Set(resources.map((r) => r.location).filter(Boolean))];
  const types = [...new Set(
    resources.filter((r) => r.location === selectedLocation).map((r) => r.type).filter(Boolean)
  )];
  const filteredResources = resources.filter(
    (r) => r.location === selectedLocation && r.type === selectedType
  );

  const handleLocationChange = (e) => {
    setSelectedLocation(e.target.value);
    setSelectedType("");
    setSelectedResource(null);
    setForm({ ...form, resourceId: "", resourceName: "" });
  };

  const handleTypeChange = (e) => {
    setSelectedType(e.target.value);
    setSelectedResource(null);
    setForm({ ...form, resourceId: "", resourceName: "" });
  };

  const handleResourceChange = (e) => {
    const resource = filteredResources.find((r) => r.id === e.target.value);
    setSelectedResource(resource);
    setForm({
      ...form,
      resourceId: resource ? resource.id : "",
      resourceName: resource ? resource.name : "",
    });
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

  const handleSubmit = async () => {
    setError(null);
    if (!form.description || !form.contactDetails) {
      setError("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    try {
      const response = await createTicket(form);
      const ticketId = response.data.id;
      if (files.length > 0) {
        await uploadAttachments(ticketId, files);
      }
      navigate("/incidents");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-light)", paddingBottom: "90px" }}>

      {/* Hero */}
      <section style={{
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(90deg, rgba(9,18,32,0.96) 0%, rgba(15,41,71,0.88) 45%, rgba(22,58,99,0.78) 100%)",
        padding: "130px 2rem 70px",
      }}>
        <div style={{ position: "absolute", top: "-120px", right: "-100px", width: "360px", height: "360px", borderRadius: "50%", background: "rgba(244,180,0,0.12)", filter: "blur(70px)" }} />
        <div style={{ position: "absolute", bottom: "-100px", left: "-80px", width: "300px", height: "300px", borderRadius: "50%", background: "rgba(255,255,255,0.06)", filter: "blur(70px)" }} />

        <div style={{ position: "relative", zIndex: 2, maxWidth: "1200px", margin: "0 auto" }}>
          <button
            onClick={() => navigate("/incidents")}
            style={{ background: "transparent", border: "none", color: "rgba(234, 169, 29, 0.7)", cursor: "pointer", fontSize: "14px", fontWeight: 600, padding: 0, marginBottom: "20px", display: "block" }}
          >
            ← Back to Incidents
          </button>

          <div style={{
            display: "inline-flex", alignItems: "center", gap: "10px", padding: "8px 18px",
            borderRadius: "999px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
            color: "rgba(255,255,255,0.88)", fontSize: "12px", fontWeight: 600, letterSpacing: "0.5px", marginBottom: "24px",
          }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--primary)", display: "inline-block" }} />
            NEW INCIDENT REPORT
          </div>

          <h1 style={{ fontSize: "clamp(34px, 5vw, 52px)", lineHeight: 1.05, fontWeight: 800, color: "#fff", letterSpacing: "-1.5px", marginBottom: "14px" }}>
            Report an Incident
          </h1>
          <p style={{ color: "rgba(255,255,255,0.72)", fontSize: "16px", lineHeight: 1.8, maxWidth: "600px" }}>
            Submit a maintenance request for any facility or equipment issue on campus.
          </p>
        </div>
      </section>

      {/* Form Content */}
      <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 2rem 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: "28px", alignItems: "start" }}>

          {/* Left - Form */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

            {/* Resource Selection */}
            <div style={{ ...pageCardStyle, padding: "30px" }}>
              <div style={pillStyle}>Location & Resource</div>
              <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-dark)", marginBottom: "20px", letterSpacing: "-0.4px" }}>
                Select the Affected Resource
              </div>

              {error && (
                <div style={{ background: "#fee2e2", border: "1px solid rgba(220,38,38,0.2)", borderRadius: "16px", padding: "14px 18px", color: "#991b1b", fontSize: "14px", marginBottom: "20px" }}>
                  {error}
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={labelStyle}>Step 1 — Location</label>
                  <select value={selectedLocation} onChange={handleLocationChange} style={inputStyle}>
                    <option value="">Select a location...</option>
                    {locations.map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>

                {selectedLocation && (
                  <div>
                    <label style={labelStyle}>Step 2 — Resource Type</label>
                    <select value={selectedType} onChange={handleTypeChange} style={inputStyle}>
                      <option value="">Select a type...</option>
                      {types.map((type) => (
                        <option key={type} value={type}>{type.replace(/_/g, " ")}</option>
                      ))}
                    </select>
                  </div>
                )}

                {selectedType && (
                  <div>
                    <label style={labelStyle}>Step 3 — Specific Resource</label>
                    <select value={selectedResource?.id || ""} onChange={handleResourceChange} style={inputStyle}>
                      <option value="">Select a resource...</option>
                      {filteredResources.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} {r.status === "OUT_OF_SERVICE" ? "(Out of Service)" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {selectedResource && (
                  <div style={{ background: "#dcfce7", border: "1px solid #bbf7d0", borderRadius: "14px", padding: "14px 18px" }}>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "#166534", marginBottom: "4px" }}>✓ Selected Resource</div>
                    <div style={{ fontSize: "14px", color: "#166534", fontWeight: 600 }}>
                      {selectedResource.name} — {selectedResource.location} — {selectedResource.type?.replace(/_/g, " ")}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Incident Details */}
            <div style={{ ...pageCardStyle, padding: "30px" }}>
              <div style={pillStyle}>Incident Details</div>
              <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-dark)", marginBottom: "20px", letterSpacing: "-0.4px" }}>
                Describe the Issue
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                <div>
                  <label style={labelStyle}>Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    style={inputStyle}
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Description *</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Describe the issue in detail..."
                    rows={5}
                    style={{ ...inputStyle, resize: "vertical" }}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Priority *</label>
                  <div style={{ display: "flex", gap: "10px" }}>
                    {priorities.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setForm({ ...form, priority: p })}
                        style={{
                          flex: 1,
                          padding: "12px",
                          borderRadius: "14px",
                          border: `2px solid ${form.priority === p
                            ? p === "HIGH" ? "#dc2626" : p === "MEDIUM" ? "#d97706" : "#16a34a"
                            : "rgba(15,23,42,0.08)"}`,
                          background: form.priority === p
                            ? p === "HIGH" ? "#fee2e2" : p === "MEDIUM" ? "#fef9c3" : "#dcfce7"
                            : "#fff",
                          color: form.priority === p
                            ? p === "HIGH" ? "#991b1b" : p === "MEDIUM" ? "#854d0e" : "#166534"
                            : "var(--text-light)",
                          fontWeight: 700,
                          fontSize: "13px",
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Contact Details *</label>
                  <input
                    type="text"
                    value={form.contactDetails}
                    onChange={(e) => setForm({ ...form, contactDetails: e.target.value })}
                    placeholder="e.g. Phone: 077XXXXXXX or email@example.com"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Attachments (max 3 images)</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    style={{ ...inputStyle, color: "var(--text-muted)" }}
                  />
                  {files.length > 0 && (
                    <span style={{ fontSize: "12px", color: "#166534", marginTop: "6px", display: "block", fontWeight: 600 }}>
                      ✓ {files.length} file(s) selected
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right - Summary + Tips */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

            {/* Summary */}
            <div style={{ ...pageCardStyle, padding: "30px" }}>
              <div style={pillStyle}>Preview</div>
              <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-dark)", marginBottom: "18px", letterSpacing: "-0.4px" }}>
                Ticket Summary
              </div>

              <div style={{ background: "var(--bg-light)", border: "1px solid rgba(15,23,42,0.08)", borderRadius: "22px", padding: "20px" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "6px" }}>Resource</div>
                <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-dark)", marginBottom: "16px" }}>
                  {selectedResource?.name || "Not selected"}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  {[
                    { label: "Category", value: form.category },
                    { label: "Priority", value: form.priority },
                    { label: "Location", value: selectedResource?.location || "-" },
                    { label: "Attachments", value: files.length > 0 ? `${files.length} file(s)` : "None" },
                  ].map((item) => (
                    <div key={item.label}>
                      <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "4px" }}>{item.label}</div>
                      <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-dark)" }}>{item.value}</div>
                    </div>
                  ))}
                </div>

                {form.description && (
                  <div style={{ marginTop: "16px" }}>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "4px" }}>Description</div>
                    <div style={{ fontSize: "13px", color: "var(--text-mid)", lineHeight: 1.6 }}>
                      {form.description.length > 80 ? form.description.slice(0, 80) + "..." : form.description}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tips */}
            <div style={{ ...pageCardStyle, padding: "30px" }}>
              <div style={pillStyle}>Guidance</div>
              <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-dark)", marginBottom: "18px", letterSpacing: "-0.4px" }}>
                Helpful Tips
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {[
                  "Select the exact resource location for faster resolution.",
                  "Set priority to HIGH only for urgent safety issues.",
                  "Upload up to 3 images as evidence of the problem.",
                  "If needed a technician will be assigned after admin review.",
                ].map((tip) => (
                  <div key={tip} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                    <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: "var(--primary)", color: "#111827", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 800, flexShrink: 0, marginTop: "2px" }}>
                      ✓
                    </div>
                    <div style={{ fontSize: "14px", color: "var(--text-mid)", lineHeight: 1.7 }}>{tip}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div style={{ ...pageCardStyle, padding: "24px" }}>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  style={{
                    background: "var(--primary)",
                    color: "#111827",
                    border: "none",
                    padding: "14px 24px",
                    borderRadius: "999px",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: loading ? "not-allowed" : "pointer",
                    boxShadow: "0 10px 24px rgba(244,180,0,0.22)",
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  {loading ? "Submitting..." : "Submit Ticket"}
                </button>

                <button
                  onClick={() => navigate("/incidents")}
                  style={{
                    background: "#fff",
                    color: "var(--text-dark)",
                    border: "1px solid rgba(15,23,42,0.08)",
                    padding: "14px 24px",
                    borderRadius: "999px",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}