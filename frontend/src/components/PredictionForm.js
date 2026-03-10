import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import axiosInstance from '../api/axiosInstance';

export default function PredictionForm() {
  const [formData, setFormData] = useState({
    temperature: 28,
    soil_ph: 6.5,
    rainfall: 120,
    field_area: 0.5,
    humidity: 75
  });

  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: parseFloat(value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);

    try {
      const response = await axiosInstance.post('/predict', formData);
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Prediction failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Temperature (°C)</Form.Label>
          <Form.Control
            type="number"
            name="temperature"
            value={formData.temperature}
            onChange={handleChange}
            step="0.1"
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Soil pH</Form.Label>
          <Form.Control
            type="number"
            name="soil_ph"
            value={formData.soil_ph}
            onChange={handleChange}
            step="0.1"
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Rainfall (mm)</Form.Label>
          <Form.Control
            type="number"
            name="rainfall"
            value={formData.rainfall}
            onChange={handleChange}
            step="0.1"
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Field Area (hectares)</Form.Label>
          <Form.Control
            type="number"
            name="field_area"
            value={formData.field_area}
            onChange={handleChange}
            step="0.01"
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Humidity (%)</Form.Label>
          <Form.Control
            type="number"
            name="humidity"
            value={formData.humidity}
            onChange={handleChange}
            step="0.1"
            required
          />
        </Form.Group>

        <Button variant="success" type="submit" className="w-100" disabled={loading}>
          {loading ? 'Predicting...' : 'Get Prediction'}
        </Button>
      </Form>

      {result && (
        <div className="mt-4">
          <Alert variant="success">
            <h5>✓ Prediction Results</h5>
            <hr />
            <h6>Numeric Predictions:</h6>
            <ul>
              {Object.entries(result.numeric).map(([key, value]) => (
                <li key={key}>{key}: {value}</li>
              ))}
            </ul>
            <h6>Recommendations:</h6>
            <ul>
              {Object.entries(result.text).map(([key, value]) => (
                <li key={key}><strong>{key}:</strong> {value}</li>
              ))}
            </ul>
            <h6>Fertilizer Calculation:</h6>
            <ul>
              {Object.entries(result.fertilizer).map(([key, value]) => (
                <li key={key}>{key}: {value}</li>
              ))}
            </ul>
          </Alert>
        </div>
      )}
    </>
  );
}