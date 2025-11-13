import React, { useEffect, useState } from "react";
import axios from "axios";

function PredictionHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPredictions = async () => {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user?.id) {
        setError("User not identified");
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`http://127.0.0.1:5000/api/predictions_by_user/${user.id}`);
        if (Array.isArray(res.data)) {
          setHistory(res.data);
        } else if (res.data.error) {
          setError(res.data.error);
        } else {
          setError("Unexpected response format");
        }
      } catch (err) {
        console.error("Error fetching predictions:", err);
        setError(err.response?.data?.error || "Failed to load predictions.");
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
  }, []);

  if (loading) return <p>Loading your prediction history...</p>;
  if (error) return <p className="text-danger">{error}</p>;

  return (
    <div>
      {history.length === 0 ? (
        <p>No predictions found yet.</p>
      ) : (
        <table className="table table-bordered table-striped">
          <thead className="table-success">
            <tr>
              <th>#</th>
              <th>Temperature</th>
              <th>Soil pH</th>
              <th>Rainfall</th>
              <th>Field Area</th>
              <th>Predicted Yield (kg/ha)</th>
              <th>Harvest Date</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {history.map((h, i) => (
              <tr key={h.id || i}>
                <td>{i + 1}</td>
                <td>{h.temperature}</td>
                <td>{h.soil_ph}</td>
                <td>{h.rainfall}</td>
                <td>{h.field_area}</td>
                <td>{h.predicted_yield_kg_ha}</td>
                <td>{h.harvesting_date || "N/A"}</td>
                <td>{h.created_at || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default PredictionHistory;
