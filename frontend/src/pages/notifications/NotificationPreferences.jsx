import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
    getPreferences,
    updatePreferences,
    resetPreferences,
} from "../../api/preferenceApi";

const preferenceConfig = [
    {
        key: "bookingEnabled",
        label: "Booking Notifications",
        description: "Get notified when your booking is approved, rejected, or cancelled.",
        icon: "📅",
        color: "#1d4ed8",
        bg: "#dbeafe",
    },
    {
        key: "alertEnabled",
        label: "Alert Notifications",
        description: "Get notified about ticket status changes and urgent updates.",
        icon: "🚨",
        color: "#dc2626",
        bg: "#fee2e2",
    },
    {
        key: "updateEnabled",
        label: "Update Notifications",
        description: "Get notified when someone comments on your ticket.",
        icon: "🔄",
        color: "#6d28d9",
        bg: "#ede9fe",
    },
    {
        key: "systemEnabled",
        label: "System Notifications",
        description: "Get notified about general system announcements.",
        icon: "🤖",
        color: "#374151",
        bg: "#f3f4f6",
    },
    {
        key: "resourceEnabled",
        label: "Resource Notifications",
        description: "Get notified about resource availability and changes.",
        icon: "🏢",
        color: "#065f46",
        bg: "#d1fae5",
    },
];

function NotificationPreferences() {
    const { userId } = useAuth();

    const [preferences, setPreferences] = useState({
        bookingEnabled:  true,
        alertEnabled:    true,
        updateEnabled:   true,
        systemEnabled:   true,
        resourceEnabled: true,
    });
    const [loading, setLoading]   = useState(true);
    const [saving, setSaving]     = useState(false);
    const [resetting, setResetting] = useState(false);
    const [saved, setSaved]       = useState(false);

    // ─── FETCH ────────────────────────────────────────────────────────────
    useEffect(() => {
        const fetchPreferences = async () => {
            if (!userId) return;
            try {
                const data = await getPreferences(userId);
                setPreferences({
                    bookingEnabled:  data.bookingEnabled,
                    alertEnabled:    data.alertEnabled,
                    updateEnabled:   data.updateEnabled,
                    systemEnabled:   data.systemEnabled,
                    resourceEnabled: data.resourceEnabled,
                });
            } catch (error) {
                console.error("Error fetching preferences:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPreferences();
    }, [userId]);

    // ─── TOGGLE ───────────────────────────────────────────────────────────
    const handleToggle = (key) => {
        setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
        setSaved(false);
    };

    // ─── SAVE ─────────────────────────────────────────────────────────────
    const handleSave = async () => {
        try {
            setSaving(true);
            await updatePreferences(userId, preferences);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            console.error("Error saving preferences:", error);
            alert("Failed to save preferences");
        } finally {
            setSaving(false);
        }
    };

    // ─── RESET ────────────────────────────────────────────────────────────
    const handleReset = async () => {
        if (!window.confirm("Reset all preferences to default (all ON)?")) return;
        try {
            setResetting(true);
            const data = await resetPreferences(userId);
            setPreferences({
                bookingEnabled:  data.bookingEnabled,
                alertEnabled:    data.alertEnabled,
                updateEnabled:   data.updateEnabled,
                systemEnabled:   data.systemEnabled,
                resourceEnabled: data.resourceEnabled,
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            console.error("Error resetting preferences:", error);
            alert("Failed to reset preferences");
        } finally {
            setResetting(false);
        }
    };

    const enabledCount = Object.values(preferences).filter(Boolean).length;

    if (loading) {
        return (
            <div style={{ textAlign: "center", padding: "80px" }}>
                <p style={{ color: "#999" }}>Loading preferences...</p>
            </div>
        );
    }

    return (
        <>
            {/* HERO */}
            <div style={{
                background: "linear-gradient(135deg, #0f172a 0%, #334155 100%)",
                color: "#ffffff",
                padding: "120px 2rem 64px",
                borderRadius: "0 0 32px 32px",
                marginBottom: "32px",
            }}>
                <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                    <div style={{
                        display: "inline-block",
                        padding: "10px 18px",
                        borderRadius: "999px",
                        backgroundColor: "rgba(255,255,255,0.12)",
                        marginBottom: "20px",
                        fontWeight: "600",
                        fontSize: "14px",
                    }}>
                        ⚙️ NOTIFICATION PREFERENCES
                    </div>
                    <h1 style={{
                        fontSize: "52px",
                        fontWeight: "800",
                        lineHeight: "1.1",
                        margin: "0 0 16px",
                    }}>
                        Control Your Notifications
                    </h1>
                    <p style={{ fontSize: "18px", color: "rgba(255,255,255,0.8)", margin: 0 }}>
                        Choose which notifications you want to receive.
                        Only the updates that matter to you.
                    </p>
                </div>
            </div>

            {/* MAIN */}
            <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 2rem 60px" }}>

                {/* STATUS BAR */}
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "28px",
                    flexWrap: "wrap",
                    gap: "12px",
                }}>
                    <div>
                        <h2 style={{ margin: "0 0 4px", fontSize: "20px", fontWeight: "700" }}>
                            Your Preferences
                        </h2>
                        <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
                            {enabledCount} of {preferenceConfig.length} notification types enabled
                        </p>
                    </div>

                    {/* Saved indicator */}
                    {saved && (
                        <div style={{
                            padding: "8px 16px",
                            background: "#f0fdf4",
                            color: "#16a34a",
                            border: "1px solid #bbf7d0",
                            borderRadius: "8px",
                            fontWeight: "700",
                            fontSize: "14px",
                        }}>
                            ✓ Saved successfully!
                        </div>
                    )}
                </div>

                {/* PREFERENCE CARDS */}
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                    marginBottom: "32px",
                }}>
                    {preferenceConfig.map((pref) => {
                        const isEnabled = preferences[pref.key];
                        return (
                            <div
                                key={pref.key}
                                style={{
                                    background: "#fff",
                                    border: isEnabled
                                        ? `2px solid ${pref.color}22`
                                        : "2px solid #e5e7eb",
                                    borderRadius: "16px",
                                    padding: "20px 24px",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    gap: "16px",
                                    boxShadow: isEnabled
                                        ? `0 4px 12px ${pref.color}11`
                                        : "0 1px 4px rgba(0,0,0,0.04)",
                                    transition: "all 0.3s ease",
                                    opacity: isEnabled ? 1 : 0.6,
                                }}
                            >
                                {/* LEFT SIDE */}
                                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                    <div style={{
                                        width: "48px",
                                        height: "48px",
                                        borderRadius: "12px",
                                        background: isEnabled ? pref.bg : "#f3f4f6",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "22px",
                                        transition: "all 0.3s ease",
                                    }}>
                                        {pref.icon}
                                    </div>
                                    <div>
                                        <h3 style={{
                                            margin: "0 0 4px",
                                            fontSize: "16px",
                                            fontWeight: "700",
                                            color: isEnabled ? "#1f2937" : "#9ca3af",
                                        }}>
                                            {pref.label}
                                        </h3>
                                        <p style={{
                                            margin: 0,
                                            fontSize: "13px",
                                            color: isEnabled ? "#6b7280" : "#9ca3af",
                                            maxWidth: "420px",
                                            lineHeight: "1.5",
                                        }}>
                                            {pref.description}
                                        </p>
                                    </div>
                                </div>

                                {/* TOGGLE SWITCH */}
                                <div
                                    onClick={() => handleToggle(pref.key)}
                                    style={{
                                        width: "52px",
                                        height: "28px",
                                        borderRadius: "999px",
                                        background: isEnabled ? "#eab308" : "#d1d5db",
                                        position: "relative",
                                        cursor: "pointer",
                                        transition: "background 0.3s ease",
                                        flexShrink: 0,
                                    }}
                                >
                                    <div style={{
                                        width: "22px",
                                        height: "22px",
                                        borderRadius: "50%",
                                        background: "#fff",
                                        position: "absolute",
                                        top: "3px",
                                        left: isEnabled ? "27px" : "3px",
                                        transition: "left 0.3s ease",
                                        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                                    }} />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ACTION BUTTONS */}
                <div style={{
                    display: "flex",
                    gap: "12px",
                    flexWrap: "wrap",
                }}>
                    {/* Reset button */}
                    <button
                        onClick={handleReset}
                        disabled={resetting}
                        style={{
                            flex: 1,
                            padding: "14px",
                            background: "#f3f4f6",
                            color: "#374151",
                            border: "1px solid #e5e7eb",
                            borderRadius: "12px",
                            fontSize: "15px",
                            fontWeight: "700",
                            cursor: resetting ? "not-allowed" : "pointer",
                            opacity: resetting ? 0.7 : 1,
                            transition: "all 0.2s",
                        }}
                        onMouseOver={(e) => !resetting && (e.currentTarget.style.background = "#e5e7eb")}
                        onMouseOut={(e) => !resetting && (e.currentTarget.style.background = "#f3f4f6")}
                    >
                        {resetting ? "Resetting..." : "🔄 Reset to Default"}
                    </button>

                    {/* Save button */}
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        style={{
                            flex: 2,
                            padding: "14px",
                            background: "#eab308",
                            color: "#000",
                            border: "none",
                            borderRadius: "12px",
                            fontSize: "15px",
                            fontWeight: "700",
                            cursor: saving ? "not-allowed" : "pointer",
                            opacity: saving ? 0.7 : 1,
                            transition: "all 0.2s",
                        }}
                        onMouseOver={(e) => !saving && (e.currentTarget.style.background = "#d4a206")}
                        onMouseOut={(e) => !saving && (e.currentTarget.style.background = "#eab308")}
                    >
                        {saving ? "Saving..." : "💾 Save Preferences"}
                    </button>
                </div>

                {/* INFO BOX */}
                <div style={{
                    marginTop: "24px",
                    padding: "16px 20px",
                    background: "#fffbeb",
                    border: "1px solid #fde68a",
                    borderRadius: "12px",
                    fontSize: "13px",
                    color: "#92400e",
                    lineHeight: "1.6",
                }}>
                    💡 <strong>Note:</strong> Turning off a notification type means you won't
                    receive automatic notifications for that category. You can change
                    these settings anytime.
                </div>
            </div>
        </>
    );
}

export default NotificationPreferences;