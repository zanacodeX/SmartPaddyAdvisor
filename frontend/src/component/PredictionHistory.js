import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Modal, Spinner } from "react-bootstrap";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* ── inline styles / design tokens ── */
const TOKEN = {
  green900: "#0d3d1a",
  green700: "#1a6b2f",
  green500: "#2d9e50",
  green300: "#52c878",
  green100: "#e8f5ec",
  green50:  "#f4fbf6",
  orange:   "#e65100",
  blue:     "#01579b",
  ink:      "#1a2420",
  muted:    "#607060",
  border:   "#cce5d4",
  white:    "#ffffff",
};

const stageColors = {
  1: [46, 125, 50],
  2: [56, 142, 60],
  3: [27, 94, 32],
  4: [2, 119, 189],
  7: [230, 81, 0],
};

/* ── stage builder ── */
const getStages = (h) => [
  {
    stage: "Stage 1 — Land Preparation",
    emoji: "🌱",
    color: stageColors[1],
    fields: [
      { label: "Temperature (°C)", value: h.temperature },
      { label: "Soil pH", value: h.soil_ph },
      { label: "Rainfall (mm)", value: h.rainfall },
      { label: "Field Area (ha)", value: h.field_area },
      { label: "Humidity (%)", value: h.humidity },
      { label: "Plough Depth (cm)", value: h.plough_depth_cm },
      { label: "Plough Method", value: h.plough_method },
      { label: "Soil Adjustment — Lime (kg)", value: h.soil_adjustment_kg_lime },
      { label: "Irrigation Advice", value: h.irrigation_advice },
    ],
  },
  {
    stage: "Stage 2 — Seed & Planting",
    emoji: "🌾",
    color: stageColors[2],
    fields: [
      { label: "Seed Amount (kg)", value: h.seed_amount_kg },
      { label: "Plant Spacing (cm)", value: h.plant_spacing_cm },
    ],
  },
  {
    stage: "Stage 3 — Basal Fertilization",
    emoji: "💊",
    color: stageColors[3],
    fields: [
      { label: "Basal Urea (kg)", value: h.fertilizer_basal_urea_kg },
      { label: "Basal TSP (kg)", value: h.fertilizer_basal_tsp_kg },
      { label: "Basal MOP (kg)", value: h.fertilizer_basal_mop_kg },
    ],
  },
  {
    stage: "Stage 4–6 — Water & Growth",
    emoji: "💧",
    color: stageColors[4],
    fields: [
      { label: "Water Mgmt Advice (Stage 4)", value: h.water_management_advice_stage4 },
      { label: "Tiller Increase Tip", value: h.tiller_increase_tip },
      { label: "2nd Dose Urea (kg)", value: h.fertilizer_2nddose_urea_kg },
      { label: "2nd Dose TSP (kg)", value: h.fertilizer_2nddose_tsp_kg },
      { label: "2nd Dose MOP (kg)", value: h.fertilizer_2nddose_mop_kg },
      { label: "Water Control (Stage 5)", value: h.water_control_advice_stage5 },
      { label: "Water Control (Stage 6)", value: h.water_control_advice_stage6 },
      { label: "Pesticide Suggestion", value: h.pesticide_suggestion },
    ],
  },
  {
    stage: "Stage 7 — Harvesting & Post-harvest",
    emoji: "🏆",
    color: stageColors[7],
    fields: [
      { label: "Water Level Advice (Stage 7)", value: h.water_level_advice_stage7 },
      { label: "Predicted Yield (kg/ha)", value: h.predicted_yield_kg_ha },
      { label: "Harvesting Date", value: h.harvesting_date },
      { label: "Final Moisture (%)", value: h.final_moisture_percent },
      { label: "Post Harvest Advice", value: h.post_harvest_advice },
    ],
  },
];

/* ── PDF generator ── */
const generatePDF = (h) => {
  const doc = new jsPDF();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const W = doc.internal.pageSize.getWidth();

  doc.setFillColor(13, 61, 26);
  doc.rect(0, 0, W, 32, "F");
  doc.setFillColor(45, 158, 80);
  doc.rect(0, 26, W, 4, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Smart Paddy Advisor", W / 2, 13, { align: "center" });
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Paddy Yield Prediction Report", W / 2, 22, { align: "center" });

  doc.setTextColor(50, 50, 50);
  doc.setFontSize(9);
  doc.text(`Farmer : ${user.name || user.email || "N/A"}`, 14, 40);
  doc.text(`Location: ${user.location || "N/A"}`, 14, 46);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 52);
  doc.text(`Date: ${h.created_at ? new Date(h.created_at).toLocaleDateString() : "N/A"}`, W - 14, 40, { align: "right" });
  doc.text(`Record #${h.id || "N/A"}`, W - 14, 46, { align: "right" });

  doc.setDrawColor(46, 125, 50);
  doc.setLineWidth(0.4);
  doc.line(14, 56, W - 14, 56);

  let y = 62;

  getStages(h).forEach((s) => {
    const valid = s.fields.filter((f) => f.value !== undefined && f.value !== null && f.value !== "");
    if (!valid.length) return;

    doc.setFillColor(...s.color);
    doc.roundedRect(14, y, W - 28, 8, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(`${s.stage}`, 18, y + 5.5);
    y += 11;

    autoTable(doc, {
      startY: y,
      head: [["Field", "Value"]],
      body: valid.map((f) => [f.label, String(f.value ?? "N/A")]),
      theme: "grid",
      headStyles: { fillColor: s.color, textColor: 255, fontSize: 8, fontStyle: "bold" },
      bodyStyles: { fontSize: 8.5, textColor: [30, 30, 30] },
      alternateRowStyles: { fillColor: [242, 250, 244] },
      columnStyles: { 0: { fontStyle: "bold", cellWidth: 78 }, 1: { cellWidth: "auto" } },
      margin: { left: 14, right: 14 },
    });

    y = doc.lastAutoTable.finalY + 7;
    if (y > 262) { doc.addPage(); y = 20; }
  });

  const pages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(160);
    doc.text(`Smart Paddy Advisor  ·  Page ${i} of ${pages}`, W / 2, doc.internal.pageSize.getHeight() - 7, { align: "center" });
  }
  doc.save(`paddy_prediction_${h.id || Date.now()}.pdf`);
};

/* ══════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════ */
export default function PredictionHistory() {
  const [history, setHistory]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [selected, setSelected]         = useState(null);
  const [showDetail, setShowDetail]     = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]         = useState(false);
  const [hoveredId, setHoveredId]       = useState(null);

  /* fetch */
  useEffect(() => {
    (async () => {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user?.id) { setError("User not identified"); setLoading(false); return; }
      try {
        const res = await axios.get(`http://127.0.0.1:5000/api/predictions?user_id=${user.id}`);
        if (Array.isArray(res.data)) setHistory(res.data);
        else setError(res.data.error || "Unexpected response");
      } catch (e) {
        setError(e.response?.data?.error || "Failed to load predictions.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* delete */
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await axios.delete(`http://127.0.0.1:5000/api/predictions/${deleteTarget}`);
      setHistory((prev) => prev.filter((p) => p.id !== deleteTarget));
      setDeleteTarget(null);
    } catch (e) {
      alert(e.response?.data?.error || "Failed to delete prediction.");
    } finally {
      setDeleting(false);
    }
  };

  /* ── loading state ── */
  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 260 }}>
      <div style={{
        width: 56, height: 56, borderRadius: "50%",
        border: `3px solid ${TOKEN.green100}`,
        borderTop: `3px solid ${TOKEN.green500}`,
        animation: "spin 0.9s linear infinite",
      }} />
      <p style={{ marginTop: 16, color: TOKEN.muted, fontFamily: "Georgia, serif", fontSize: 14, letterSpacing: 1 }}>
        Loading records…
      </p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (error) return (
    <div style={{ textAlign: "center", padding: "40px 20px" }}>
      <span style={{ fontSize: 36 }}>⚠️</span>
      <p style={{ color: "#c62828", marginTop: 10, fontFamily: "Georgia, serif" }}>{error}</p>
    </div>
  );

  /* ── empty state ── */
  if (history.length === 0) return (
    <div style={{ textAlign: "center", padding: "60px 20px" }}>
      <div style={{ fontSize: 56, marginBottom: 12 }}>🌾</div>
      <p style={{ color: TOKEN.muted, fontFamily: "Georgia, serif", fontSize: 16 }}>
        No predictions recorded yet.
      </p>
      <p style={{ color: TOKEN.muted, fontSize: 13 }}>Make your first prediction to see results here.</p>
    </div>
  );

  /* ── main render ── */
  return (
    <div style={{ fontFamily: "'Georgia', serif" }}>
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .pred-card {
          animation: fadeSlideIn 0.35s ease both;
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .pred-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(27,94,32,0.13) !important;
        }
        .action-btn {
          border: none;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          padding: 6px 14px;
          border-radius: 20px;
          transition: all 0.18s;
          letter-spacing: 0.3px;
        }
        .action-btn:hover { filter: brightness(1.1); transform: scale(1.04); }
        .stage-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.3px;
        }
      `}</style>

      {/* ── Header bar ── */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: 24, paddingBottom: 14,
        borderBottom: `2px solid ${TOKEN.border}`,
      }}>
        <div>
          <h5 style={{ margin: 0, color: TOKEN.green900, fontWeight: 700, fontSize: 18, letterSpacing: 0.3 }}>
            Prediction Records
          </h5>
          <p style={{ margin: "3px 0 0", color: TOKEN.muted, fontSize: 12 }}>
            {history.length} record{history.length !== 1 ? "s" : ""} found
          </p>
        </div>
        <div style={{
          background: TOKEN.green100, borderRadius: 10,
          padding: "8px 16px", textAlign: "center",
        }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: TOKEN.green700, lineHeight: 1 }}>
            {history.length}
          </div>
          <div style={{ fontSize: 10, color: TOKEN.muted, marginTop: 2, letterSpacing: 0.5 }}>TOTAL</div>
        </div>
      </div>

      {/* ── Cards ── */}
      {history.map((h, i) => (
        <div
          key={h.id || i}
          className="pred-card"
          style={{
            animationDelay: `${i * 0.06}s`,
            marginBottom: 16,
            borderRadius: 14,
            border: `1px solid ${TOKEN.border}`,
            background: TOKEN.white,
            boxShadow: "0 2px 10px rgba(27,94,32,0.07)",
            overflow: "hidden",
          }}
        >
          {/* Card top accent bar */}
          <div style={{
            height: 4,
            background: `linear-gradient(90deg, ${TOKEN.green700}, ${TOKEN.green300})`,
          }} />

          <div style={{ padding: "16px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>

              {/* Left content */}
              <div style={{ flex: 1, minWidth: 220 }}>
                {/* Title row */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: `linear-gradient(135deg, ${TOKEN.green700}, ${TOKEN.green300})`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontWeight: 800, fontSize: 13, flexShrink: 0,
                  }}>
                    {i + 1}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: TOKEN.green900, fontSize: 15 }}>
                      Prediction #{i + 1}
                    </div>
                    <div style={{ fontSize: 11, color: TOKEN.muted }}>
                      {h.created_at ? new Date(h.created_at).toLocaleString() : "N/A"}
                    </div>
                  </div>
                </div>

                {/* Input metrics row */}
                <div style={{
                  display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12,
                }}>
                  {[
                    { icon: "🌡️", label: "Temp", val: `${h.temperature}°C` },
                    { icon: "🧪", label: "pH", val: h.soil_ph },
                    { icon: "🌧️", label: "Rain", val: `${h.rainfall} mm` },
                    { icon: "📐", label: "Area", val: `${h.field_area} ha` },
                    { icon: "💧", label: "Humidity", val: `${h.humidity}%` },
                  ].map((m) => (
                    <div key={m.label} style={{
                      background: TOKEN.green50,
                      border: `1px solid ${TOKEN.border}`,
                      borderRadius: 8, padding: "5px 10px",
                      fontSize: 12, color: TOKEN.ink,
                    }}>
                      {m.icon} <span style={{ color: TOKEN.muted, fontSize: 11 }}>{m.label}:</span>{" "}
                      <b style={{ color: TOKEN.green700 }}>{m.val}</b>
                    </div>
                  ))}
                </div>

                {/* Yield + harvest highlight */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 16,
                  padding: "10px 14px",
                  background: `linear-gradient(135deg, ${TOKEN.green100}, #fff)`,
                  borderRadius: 10,
                  border: `1px solid ${TOKEN.border}`,
                }}>
                  <div>
                    <div style={{ fontSize: 10, color: TOKEN.muted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 2 }}>
                      Predicted Yield
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: TOKEN.green700, lineHeight: 1 }}>
                      {h.predicted_yield_kg_ha ? `${Number(h.predicted_yield_kg_ha).toFixed(2)}` : "—"}
                      <span style={{ fontSize: 12, fontWeight: 500, color: TOKEN.muted, marginLeft: 4 }}>kg/ha</span>
                    </div>
                  </div>
                  {h.harvesting_date && h.harvesting_date !== "N/A" && (
                    <>
                      <div style={{ width: 1, height: 36, background: TOKEN.border }} />
                      <div>
                        <div style={{ fontSize: 10, color: TOKEN.muted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 2 }}>
                          Harvest Date
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: TOKEN.orange }}>
                          📅 {h.harvesting_date}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Right: actions */}
              <div style={{
                display: "flex", flexDirection: "column", gap: 8,
                alignItems: "flex-end", justifyContent: "flex-start",
              }}>
                <button
                  className="action-btn"
                  style={{ background: TOKEN.green700, color: "#fff" }}
                  onClick={() => { setSelected(h); setShowDetail(true); }}
                >
                  👁 View Details
                </button>
                <button
                  className="action-btn"
                  style={{ background: TOKEN.green500, color: "#fff" }}
                  onClick={() => generatePDF(h)}
                >
                  📄 Download PDF
                </button>
                <button
                  className="action-btn"
                  style={{ background: "#fff1f0", color: "#c62828", border: "1px solid #ffcdd2" }}
                  onClick={() => setDeleteTarget(h.id)}
                >
                  🗑 Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* ══ DETAIL MODAL ══ */}
      <Modal show={showDetail} onHide={() => setShowDetail(false)} size="lg" centered scrollable>
        <Modal.Header closeButton style={{
          background: `linear-gradient(135deg, ${TOKEN.green900}, ${TOKEN.green700})`,
          borderBottom: "none", padding: "18px 24px",
        }}>
          <Modal.Title style={{ color: "#fff", fontWeight: 700, fontSize: 17, fontFamily: "Georgia, serif" }}>
            🌾 Full Prediction Report
          </Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ background: TOKEN.green50, padding: 24 }}>
          {selected && getStages(selected).map((s) => {
            const valid = s.fields.filter((f) => f.value !== undefined && f.value !== null && f.value !== "");
            if (!valid.length) return null;
            const [r, g, b] = s.color;
            return (
              <div key={s.stage} style={{
                marginBottom: 16, borderRadius: 12, overflow: "hidden",
                border: `1px solid rgba(${r},${g},${b},0.25)`,
                background: TOKEN.white,
                boxShadow: `0 2px 10px rgba(${r},${g},${b},0.08)`,
              }}>
                {/* Stage header */}
                <div style={{
                  background: `rgb(${r},${g},${b})`,
                  padding: "10px 16px",
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  <span style={{ fontSize: 16 }}>{s.emoji}</span>
                  <span style={{ color: "#fff", fontWeight: 700, fontSize: 13, letterSpacing: 0.3 }}>
                    {s.stage}
                  </span>
                </div>

                {/* Fields grid */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                  gap: "1px",
                  background: TOKEN.border,
                }}>
                  {valid.map((f) => (
                    <div key={f.label} style={{
                      background: TOKEN.white,
                      padding: "12px 16px",
                    }}>
                      <div style={{
                        fontSize: 10, color: TOKEN.muted,
                        textTransform: "uppercase", letterSpacing: 0.8,
                        fontWeight: 600, marginBottom: 4,
                      }}>
                        {f.label}
                      </div>
                      <div style={{ fontWeight: 700, color: TOKEN.ink, fontSize: 14 }}>
                        {f.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </Modal.Body>

        <Modal.Footer style={{ background: TOKEN.green50, borderTop: `1px solid ${TOKEN.border}` }}>
          <button className="action-btn" style={{ background: TOKEN.green700, color: "#fff" }}
            onClick={() => selected && generatePDF(selected)}>
            📄 Download PDF
          </button>
          <button className="action-btn"
            style={{ background: "#fff", color: TOKEN.muted, border: `1px solid ${TOKEN.border}` }}
            onClick={() => setShowDetail(false)}>
            Close
          </button>
        </Modal.Footer>
      </Modal>

      {/* ══ DELETE CONFIRM MODAL ══ */}
      <Modal show={!!deleteTarget} onHide={() => !deleting && setDeleteTarget(null)} centered size="sm">
        <Modal.Body style={{ padding: 32, textAlign: "center", fontFamily: "Georgia, serif" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🗑️</div>
          <h6 style={{ fontWeight: 700, color: TOKEN.ink, marginBottom: 8 }}>Delete Prediction?</h6>
          <p style={{ color: TOKEN.muted, fontSize: 13, marginBottom: 24 }}>
            This record will be permanently removed and cannot be recovered.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button
              className="action-btn"
              style={{ background: "#c62828", color: "#fff", padding: "8px 20px" }}
              onClick={confirmDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting…" : "Yes, Delete"}
            </button>
            <button
              className="action-btn"
              style={{ background: "#fff", color: TOKEN.muted, border: `1px solid ${TOKEN.border}`, padding: "8px 20px" }}
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              Cancel
            </button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}