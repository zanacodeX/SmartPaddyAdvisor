import React, { useState } from "react";
import axios from "axios";

function PredictionForm() {
  const [form, setForm] = useState({
    temperature: "",
    soil_ph: "",
    rainfall: "",
    field_area: "",
    humidity: "",
  });

  const [result, setResult] = useState(null);

  // Handle input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Convert form values to numbers before sending
      const numericForm = Object.fromEntries(
        Object.entries(form).map(([key, value]) => [key, Number(value)])
      );

      const res = await axios.post("http://127.0.0.1:5000/predict", numericForm);
      setResult(res.data);
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to connect to backend.");
    }
  };

 // Group numeric and text results by stages
  const getStageResults = () => {
    if (!result) return [];

    const { numeric, text, fertilizer } = result;

    return [
      {
        stage: "Land Preparation (Stage 1)",
        fields: [
          { label: "PloughDepth_cm", value: numeric?.PloughDepth_cm },
          { label: "PloughMethod", value: text?.PloughMethod },
          { label: "SoilAdjustment_kgLime", value: numeric?.SoilAdjustment_kgLime },
          { label: "IrrigationAdvice", value: text?.IrrigationAdvice },
        ],
      },
      {
        stage: "Seed & Planting (Stage 2)",
        fields: [
          { label: "SeedAmount_kg", value: numeric?.SeedAmount_kg },
          { label: "PlantSpacing_cm", value: numeric?.PlantSpacing_cm },
        ],
      },
      {
        stage: "Basal Fertilization (Stage 3)",
        fields: [
          { label: "Fertilizer_Basal_Urea_kg", value: numeric?.Fertilizer_Basal_Urea_kg },
          { label: "Fertilizer_Basal_TSP_kg", value: numeric?.Fertilizer_Basal_TSP_kg },
          { label: "Fertilizer_Basal_MOP_kg", value: numeric?.Fertilizer_Basal_MOP_kg },
        ],
      },
      {
        stage: "Water & Growth Management (Stages 4,6)",
        fields: [
          { label: "WaterManagementAdvice_Stage4", value: text?.WaterManagementAdvice_Stage4 },
          { label: "TillerIncreaseTip", value: text?.TillerIncreaseTip },
          { label: "Fertilizer_2ndDose_Urea_kg", value: numeric?.Fertilizer_2ndDose_Urea_kg },
          { label: "Fertilizer_2ndDose_TSP_kg", value: numeric?.Fertilizer_2ndDose_TSP_kg },
          { label: "Fertilizer_2ndDose_MOP_kg", value: numeric?.Fertilizer_2ndDose_MOP_kg },
          { label: "WaterControlAdvice_Stage5", value: text?.WaterControlAdvice_Stage5 },
          { label: "WaterControlAdvice_Stage6", value: text?.WaterControlAdvice_Stage6 },
          { label: "PesticideSuggestion", value: text?.PesticideSuggestion },
          { label: "HumidityTarget_%", value: numeric?.["Humidity_%"] || form.humidity },
        ],
      },
      {
        stage: "Harvesting & Post-harvest (Stage 7)",
        fields: [
          { label: "WaterLevelAdvice_Stage7", value: text?.WaterLevelAdvice_Stage7 },
          { label: "PredictedYield_kg_ha", value: numeric?.PredictedYield_kg_ha },
          { label: "HarvestingDate", value: text?.HarvestingDate },
          { label: "FinalMoisture_%", value: numeric?.["FinalMoisture_%"] },
          { label: "PostHarvestAdvice", value: text?.PostHarvestAdvice },
        ],
      },
    ];
  };

  return (
    <div style={{ maxWidth: "800px", margin: "auto", padding: "20px", border: "1px solid #ccc", borderRadius: "10px", background: "#f9f9f9" }}>
      <h2>🌾 Smart Paddy Advisor</h2>

      <form onSubmit={handleSubmit}>
        {Object.keys(form).map((key) => (
          <div key={key} style={{ marginBottom: "10px" }}>
            <label style={{ textTransform: "capitalize" }}>{key.replace("_", " ")}:</label>
            <input
              type="number"
              step="any"
              name={key}
              value={form[key]}
              onChange={handleChange}
              required
              style={{ marginLeft: "10px", padding: "5px", borderRadius: "5px", border: "1px solid #ccc" }}
            />
          </div>
        ))}

        <button
          type="submit"
          style={{ padding: "10px 20px", backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
        >
          Predict Yield
        </button>
      </form>

      {result && (
        <div style={{ marginTop: "20px", padding: "15px", borderRadius: "8px", background: "#e8f5e9" }}>
          <h3>🌱 Prediction Result</h3>
          {getStageResults().map((stage) => (
            <div key={stage.stage} style={{ marginBottom: "15px" }}>
              <h4>{stage.stage}</h4>
              <ul>
                {stage.fields.map((field) =>
                  field.value !== undefined && field.value !== null ? (
                    <li key={field.label}>
                      <b>{field.label}:</b> {field.value}
                    </li>
                  ) : null
                )}
              </ul>
            </div>
          ))}

          {/* Fertilizer Recommendations */}
          {result?.fertilizer && (
            <div>
              <h4>💊 Fertilizer Recommendation</h4>
              <ul>
                <li>TSP: {result.fertilizer.TSP_kg} kg</li>
                <li>MOP: {result.fertilizer.MOP_kg} kg</li>
                <li>Urea: {result.fertilizer.Urea_kg} kg</li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PredictionForm;