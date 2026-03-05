import React, { useState } from 'react';
import { Container, Form, Button, Alert, Card, Spinner, Row, Col, Badge } from 'react-bootstrap';
import axiosInstance from '../api/axiosInstance';
import '../styles/Detection.css';

export default function DiseaseDetection() {
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setError(null);
      setResult(null);

      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      setImageFile(file);
      setError(null);
      setResult(null);

      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle prediction
  const handlePredict = async () => {
    if (!imageFile) {
      setError('Please select an image first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await axiosInstance.post('/api/disease-detection', formData);

      if (response.data.success) {
        setResult(response.data);
      } else {
        setError(response.data.error || 'Prediction failed');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Error during prediction');
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setImageFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  const getConfidenceBadgeVariant = (confidence) => {
    if (confidence >= 80) return 'success';
    if (confidence >= 60) return 'warning';
    return 'danger';
  };

  return (
    <Container className="detection-container">
      <Row className="mb-4">
        <Col>
          <h2>🌾 Rice Leaf Disease Detection</h2>
          <p className="text-muted">Upload an image of a rice leaf to detect diseases</p>
        </Col>
      </Row>

      {/* Error Alert */}
      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}

      <Row className="mb-4">
        <Col lg={6}>
          {/* Upload Area */}
          <Card className="mb-3">
            <Card.Header className="bg-success text-white">
              <h5 className="mb-0">Upload Image</h5>
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <div
                    className="dropzone"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    {preview ? (
                      <>
                        <img
                          src={preview}
                          alt="Preview"
                          className="preview-image"
                        />
                        <p className="mt-2 small text-muted">
                          {imageFile?.name}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="large">📁</p>
                        <p>Drag & drop your image here or click to select</p>
                      </>
                    )}
                  </div>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="mt-3 d-none"
                    id="file-input"
                  />
                  <label
                    htmlFor="file-input"
                    className="btn btn-outline-secondary w-100 mt-3"
                  >
                    Choose Image
                  </label>
                </Form.Group>

                <div className="d-grid gap-2">
                  <Button
                    variant="success"
                    onClick={handlePredict}
                    disabled={!imageFile || loading}
                  >
                    {loading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Analyzing...
                      </>
                    ) : (
                      '🔍 Detect Disease'
                    )}
                  </Button>
                  {(imageFile || result) && (
                    <Button variant="outline-secondary" onClick={handleReset}>
                      Reset
                    </Button>
                  )}
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* Results Area */}
        <Col lg={6}>
          {result && (
            <Card className="mb-3 shadow-sm">
              <Card.Header className="bg-info text-white">
                <h5 className="mb-0">🔬 Detection Results</h5>
              </Card.Header>
              <Card.Body>
                <div className="mb-3">
                  <h4>Detected Disease</h4>
                  <h3 className="text-danger mb-3">{result.disease}</h3>
                </div>

                {result.confidence && (
                  <div className="mb-3">
                    <p className="mb-2">
                      <strong>Confidence:</strong>{' '}
                      <Badge
                        bg={getConfidenceBadgeVariant(result.confidence)}
                      >
                        {result.confidence.toFixed(2)}%
                      </Badge>
                    </p>
                  </div>
                )}

                {result.info && (
                  <>
                    <div className="mb-3">
                      <h6>Description</h6>
                      <p>{result.info.description}</p>
                    </div>

                    {result.info.symptoms && (
                      <div className="mb-3">
                        <h6>Symptoms</h6>
                        <ul className="small">
                          {result.info.symptoms.map((symptom, idx) => (
                            <li key={idx}>{symptom}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {result.info.treatment && (
                      <div className="mb-3">
                        <h6>Treatment</h6>
                        <ul className="small">
                          {result.info.treatment.map((treatment, idx) => (
                            <li key={idx}>{treatment}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {result.info.prevention && (
                      <div className="mb-3">
                        <h6>Prevention</h6>
                        <ul className="small">
                          {result.info.prevention.map((prev, idx) => (
                            <li key={idx}>{prev}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </Card.Body>
            </Card>
          )}

          {!result && !loading && !preview && (
            <Card className="text-center text-muted">
              <Card.Body>
                <p className="mt-5">
                  Upload an image to see detection results here
                </p>
                <p className="mb-5">👈</p>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
}
