import React, { useState } from "react";
import axios from "axios";

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

const STAGE_COLORS = {
  0: { bg: [46, 125, 50],  light: "#e8f5ec" },
  1: { bg: [56, 142, 60],  light: "#f1f8f1" },
  2: { bg: [27, 94, 32],   light: "#e8f5ec" },
  3: { bg: [2, 119, 189],  light: "#e3f2fd" },
  4: { bg: [230, 81, 0],   light: "#fff3e0" },
};

const FIELD_LABELS = {
  temperature: "Temperature (°C)",
  soil_ph:     "Soil pH",
  rainfall:    "Rainfall (mm)",
  field_area:  "Field Area (ha)",
  humidity:    "Humidity (%)",
};

const FIELD_ICONS = {
  temperature: "🌡️",
  soil_ph:     "🧪",
  rainfall:    "🌧️",
  field_area:  "📐",
  humidity:    "💧",
};

function PredictionForm() {
  const [form, setForm] = useState({
    temperature: "",
    soil_ph: "",
    rainfall: "",
    field_area: "",
    humidity: "",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSaved(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setSaved(false);
    try {
      const numericForm = Object.fromEntries(
        Object.entries(form).map(([key, value]) => [key, Number(value)])
      );
      const res = await axios.post("http://127.0.0.1:5000/predict", numericForm);
      setResult(res.data);
    } catch (error) {
      console.error(error);
      alert("Failed to connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!result) return alert("No prediction to save");
    setSaving(true);
    try {
      await axios.post("http://127.0.0.1:5000/api/save_prediction", {
        user_id: user.id,
        prediction: {
          ...form,
          ...result.numeric,
          ...result.text,
          ...(result.fertilizer || {}),
        },
      });
      setSaved(true);
    } catch (err) {
      console.error(err);
      alert("Failed to save prediction");
    } finally {
      setSaving(false);
    }
  };

  const getStageResults = () => {
    if (!result) return [];
    const { numeric, text, fertilizer } = result;
    return [
      {
        stage: "Land Preparation",
        stageNum: "Stage 1",
        emoji: "",
        colorIdx: 0,
        fields: [
          { label: "Plough Depth (cm)", value: numeric?.PloughDepth_cm },
          { label: "Plough Method", value: text?.PloughMethod },
          { label: "Soil Adjustment — Lime (kg)", value: numeric?.SoilAdjustment_kgLime },
          { label: "Irrigation Advice", value: text?.IrrigationAdvice },
        ],
      },
      {
        stage: "Seed & Planting",
        stageNum: "Stage 2",
        emoji: "",
        colorIdx: 1,
        fields: [
          { label: "Seed Amount (kg)", value: numeric?.SeedAmount_kg },
          { label: "Plant Spacing (cm)", value: numeric?.PlantSpacing_cm },
        ],
      },
      {
        stage: "Basal Fertilization",
        stageNum: "Stage 3",
        emoji: "",
        colorIdx: 2,
        fields: [
          { label: "Basal Urea (kg)", value: numeric?.Fertilizer_Basal_Urea_kg },
          { label: "Basal TSP (kg)", value: numeric?.Fertilizer_Basal_TSP_kg },
          { label: "Basal MOP (kg)", value: numeric?.Fertilizer_Basal_MOP_kg },
        ],
      },
      {
        stage: "Water & Growth Management",
        stageNum: "Stages 4 – 6",
        emoji: "",
        colorIdx: 3,
        fields: [
          { label: "Water Mgmt Advice (Stage 4)", value: text?.WaterManagementAdvice_Stage4 },
          { label: "Tiller Increase Tip", value: text?.TillerIncreaseTip },
          { label: "2nd Dose Urea (kg)", value: numeric?.Fertilizer_2ndDose_Urea_kg },
          { label: "2nd Dose TSP (kg)", value: numeric?.Fertilizer_2ndDose_TSP_kg },
          { label: "2nd Dose MOP (kg)", value: numeric?.Fertilizer_2ndDose_MOP_kg },
          { label: "Water Control (Stage 5)", value: text?.WaterControlAdvice_Stage5 },
          { label: "Water Control (Stage 6)", value: text?.WaterControlAdvice_Stage6 },
          { label: "Pesticide Suggestion", value: text?.PesticideSuggestion },
          { label: "Humidity Target (%)", value: numeric?.["HumidityTarget_%"] || form.humidity },
        ],
      },
      {
        stage: "Harvesting & Post-harvest",
        stageNum: "Stage 7",
        emoji: "",
        colorIdx: 4,
        fields: [
          { label: "Water Level Advice (Stage 7)", value: text?.WaterLevelAdvice_Stage7 },
          { label: "Predicted Yield (kg/ha)", value: numeric?.PredictedYield_kg_ha },
          { label: "Harvesting Date", value: text?.HarvestingDate },
          { label: "Final Moisture (%)", value: numeric?.["FinalMoisture_%"] },
          { label: "Post Harvest Advice", value: text?.PostHarvestAdvice },
        ],
      },
    ];
  };

  return (
    <div style={{ fontFamily: "'Georgia', serif", maxWidth: 820, margin: "0 auto" }}>
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .pred-input:focus {
          outline: none;
          border-color: #2d9e50 !important;
          box-shadow: 0 0 0 3px rgba(45,158,80,0.15);
        }
        .pred-input::placeholder { color: #b0c4b8; }
        .submit-btn:hover { filter: brightness(1.08); transform: translateY(-1px); }
        .submit-btn:active { transform: translateY(0); }
        .save-btn:hover { filter: brightness(1.08); transform: translateY(-1px); }
        .stage-card { animation: fadeSlideIn 0.35s ease both; }
      `}</style>

      {/* ── Input Card ── */}
      <div style={{
        background: TOKEN.white,
        borderRadius: 16,
        border: `1px solid ${TOKEN.border}`,
        boxShadow: "0 4px 20px rgba(27,94,32,0.08)",
        overflow: "hidden",
        marginBottom: 24,
      }}>
        {/* Card header */}
        <div style={{
          background: `linear-gradient(135deg, ${TOKEN.green900}, ${TOKEN.green700})`,
          padding: "20px 28px",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position:"absolute", top:-20, right:-20, width:100, height:100, borderRadius:"50%", background:"rgba(255,255,255,0.06)" }} />
          <div style={{ position:"absolute", bottom:-30, right:60, width:70, height:70, borderRadius:"50%", background:"rgba(255,255,255,0.04)" }} />
          <h5 style={{ margin:0, color:"#fff", fontWeight:700, fontSize:18, letterSpacing:0.3 }}>
            🌾 Paddy Yield Prediction
          </h5>
          <p style={{ margin:"4px 0 0", color:"rgba(255,255,255,0.7)", fontSize:13 }}>
            Enter your field conditions to get a full farming recommendation
          </p>
        </div>

        {/* Top accent */}
        <div style={{ height:3, background:`linear-gradient(90deg, ${TOKEN.green500}, ${TOKEN.green300})` }} />

        {/* Form body */}
        <div style={{ padding: "24px 28px" }}>
          <form onSubmit={handleSubmit}>
            {/* Input grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 16,
              marginBottom: 24,
            }}>
              {Object.keys(form).map((key) => (
                <div key={key}>
                  <label style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 700,
                    color: TOKEN.muted,
                    textTransform: "uppercase",
                    letterSpacing: 0.8,
                    marginBottom: 6,
                  }}>
                    {FIELD_ICONS[key]} {FIELD_LABELS[key] || key.replace(/_/g, " ")}
                  </label>
                  <input
                    className="pred-input"
                    type="number"
                    step="any"
                    name={key}
                    value={form[key]}
                    onChange={handleChange}
                    required
                    placeholder="Enter value"
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: 10,
                      border: `1.5px solid ${TOKEN.border}`,
                      background: TOKEN.green50,
                      fontSize: 14,
                      color: TOKEN.ink,
                      fontFamily: "Georgia, serif",
                      transition: "border-color 0.2s, box-shadow 0.2s",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Submit button */}
            <button
              className="submit-btn"
              type="submit"
              disabled={loading}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "12px 32px",
                background: loading
                  ? TOKEN.muted
                  : `linear-gradient(135deg, ${TOKEN.green700}, ${TOKEN.green500})`,
                color: "#fff",
                border: "none",
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 700,
                fontFamily: "Georgia, serif",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                boxShadow: loading ? "none" : "0 4px 14px rgba(27,94,32,0.3)",
                letterSpacing: 0.3,
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: 16, height: 16, borderRadius: "50%",
                    border: "2px solid rgba(255,255,255,0.4)",
                    borderTop: "2px solid #fff",
                    animation: "spin 0.8s linear infinite",
                  }} />
                  Predicting…
                </>
              ) : (
                <> 🔍 Predict Result </>
              )}
            </button>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </form>
        </div>
      </div>

      {/* ── Results ── */}
      {result && (
        <div style={{ animation: "fadeSlideIn 0.4s ease" }}>

          {/* Results header */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            marginBottom: 20, paddingBottom: 14,
            borderBottom: `2px solid ${TOKEN.border}`,
          }}>
            <div>
              <h6 style={{ margin: 0, color: TOKEN.green900, fontWeight: 700, fontSize: 17 }}>
                🌱 Prediction Results
              </h6>
              <p style={{ margin: "3px 0 0", color: TOKEN.muted, fontSize: 12 }}>
                Full stage-by-stage farming recommendation
              </p>
            </div>

            {/* Yield highlight badge */}
            {result.numeric?.PredictedYield_kg_ha && (
              <div style={{
                background: `linear-gradient(135deg, ${TOKEN.green100}, #fff)`,
                border: `1px solid ${TOKEN.border}`,
                borderRadius: 12, padding: "10px 18px", textAlign: "center",
              }}>
                <div style={{ fontSize: 10, color: TOKEN.muted, textTransform: "uppercase", letterSpacing: 0.8 }}>
                  Predicted Yield
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: TOKEN.green700, lineHeight: 1.2 }}>
                  {Number(result.numeric.PredictedYield_kg_ha).toFixed(2)}
                  <span style={{ fontSize: 12, fontWeight: 500, color: TOKEN.muted, marginLeft: 4 }}>kg/ha</span>
                </div>
              </div>
            )}
          </div>

          {/* Stage cards */}
          {getStageResults().map((stage, idx) => {
            const validFields = stage.fields.filter(
              (f) => f.value !== undefined && f.value !== null && f.value !== ""
            );
            if (!validFields.length) return null;
            const { bg, light } = STAGE_COLORS[stage.colorIdx] || STAGE_COLORS[0];
            const [r, g, b] = bg;

            return (
              <div
                key={stage.stage}
                className="stage-card"
                style={{
                  animationDelay: `${idx * 0.07}s`,
                  marginBottom: 16,
                  borderRadius: 14,
                  border: `1px solid rgba(${r},${g},${b},0.25)`,
                  background: TOKEN.white,
                  boxShadow: `0 2px 10px rgba(${r},${g},${b},0.07)`,
                  overflow: "hidden",
                }}
              >
                {/* Stage header */}
                <div style={{
                  background: `rgb(${r},${g},${b})`,
                  padding: "11px 18px",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 16 }}>{stage.emoji}</span>
                    <span style={{ color: "#fff", fontWeight: 700, fontSize: 13, letterSpacing: 0.3 }}>
                      {stage.stage}
                    </span>
                  </div>
                  <span style={{
                    background: "rgba(255,255,255,0.22)",
                    color: "#fff", fontSize: 10, fontWeight: 700,
                    padding: "2px 10px", borderRadius: 20, letterSpacing: 0.5,
                  }}>
                    {stage.stageNum}
                  </span>
                </div>

                {/* Fields grid */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                  gap: "1px",
                  background: TOKEN.border,
                }}>
                  {validFields.map((field) => (
                    <div key={field.label} style={{
                      background: TOKEN.white,
                      padding: "12px 16px",
                    }}>
                      <div style={{
                        fontSize: 10, color: TOKEN.muted,
                        textTransform: "uppercase", letterSpacing: 0.8,
                        fontWeight: 600, marginBottom: 4,
                      }}>
                        {field.label}
                      </div>
                      <div style={{ fontWeight: 700, color: TOKEN.ink, fontSize: 14 }}>
                        {field.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Fertilizer summary card */}
          {result?.fertilizer && (
            <div
              className="stage-card"
              style={{
                animationDelay: "0.4s",
                marginBottom: 16,
                borderRadius: 14,
                border: `1px solid rgba(27,94,32,0.2)`,
                background: TOKEN.white,
                boxShadow: "0 2px 10px rgba(27,94,32,0.07)",
                overflow: "hidden",
              }}
            >
              <div style={{
                background: `linear-gradient(135deg, ${TOKEN.green900}, ${TOKEN.green700})`,
                padding: "11px 18px",
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <span style={{ fontSize: 16 }}>🧪</span>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: 13, letterSpacing: 0.3 }}>
                  Fertilizer Summary
                </span>
              </div>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "1px",
                background: TOKEN.border,
              }}>
                {[
                  { label: "TSP (kg)", value: result.fertilizer.TSP_kg },
                  { label: "MOP (kg)", value: result.fertilizer.MOP_kg },
                  { label: "Urea (kg)", value: result.fertilizer.Urea_kg },
                ].map((f) => (
                  <div key={f.label} style={{
                    background: TOKEN.green50,
                    padding: "14px 16px", textAlign: "center",
                  }}>
                    <div style={{ fontSize: 10, color: TOKEN.muted, textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 600, marginBottom: 4 }}>
                      {f.label}
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: TOKEN.green700 }}>
                      {f.value ?? "—"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Save button */}
          <div style={{ marginTop: 8, paddingTop: 16, borderTop: `1px solid ${TOKEN.border}` }}>
            <button
              className="save-btn"
              onClick={handleSave}
              disabled={saving || saved}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "12px 32px",
                background: saved
                  ? `linear-gradient(135deg, #1565c0, #1976d2)`
                  : saving
                  ? TOKEN.muted
                  : `linear-gradient(135deg, #01579b, #0277bd)`,
                color: "#fff",
                border: "none",
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 700,
                fontFamily: "Georgia, serif",
                cursor: saving || saved ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                boxShadow: saving || saved ? "none" : "0 4px 14px rgba(1,87,155,0.3)",
                letterSpacing: 0.3,
              }}
            >
              {saving ? (
                <>
                  <div style={{
                    width: 16, height: 16, borderRadius: "50%",
                    border: "2px solid rgba(255,255,255,0.4)",
                    borderTop: "2px solid #fff",
                    animation: "spin 0.8s linear infinite",
                  }} />
                  Saving…
                </>
              ) : saved ? (
                <> ✅ Saved to History </>
              ) : (
                <>  Save Prediction </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PredictionForm;