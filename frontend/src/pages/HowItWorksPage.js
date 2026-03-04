import React from 'react';
import { Container, Navbar, Nav, Button, Card, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

export default function HowItWorksPage() {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };

  const handleRegister = () => {
    navigate('/register');
  };

  return (
    <>
      {/* Header / Navbar */}
      <Navbar bg="success" variant="dark" expand="lg" sticky="top">
        <Container>
          <Navbar.Brand onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            🌾 Smart Paddy Advisor
          </Navbar.Brand>
          <Nav className="ms-auto">
            <Nav.Link onClick={() => navigate('/')}>Home</Nav.Link>
            <Nav.Link onClick={() => navigate('/about')}>About</Nav.Link>
            <Nav.Link onClick={() => navigate('/how-it-works')}>How it works</Nav.Link>
            <Nav.Link onClick={() => navigate('/contact')}>Contact</Nav.Link>
            <Button variant="outline-light" size="sm" className="me-2" onClick={handleLogin}>
              Login
            </Button>
            <Button variant="light" size="sm" onClick={handleRegister}>
              Register
            </Button>
          </Nav>
        </Container>
      </Navbar>

      {/* How It Works Content */}
      <Container className="my-5">
        <h1>How Smart Paddy Advisor Works</h1>
        <p className="lead">
          Get started with Smart Paddy Advisor in just a few simple steps.
        </p>

        <h2 className="mt-5 mb-4">5-Step Process</h2>

        <Row className="mb-4">
          <Col md={6} className="mb-3">
            <Card className="shadow-sm h-100">
              <Card.Body>
                <div className="mb-3">
                  <span className="badge bg-success" style={{ fontSize: '1.5rem', padding: '10px 15px' }}>
                    1
                  </span>
                </div>
                <Card.Title>Register/Login</Card.Title>
                <Card.Text>
                  Create a free account or log in to your existing account to access the Smart Paddy Advisor platform.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} className="mb-3">
            <Card className="shadow-sm h-100">
              <Card.Body>
                <div className="mb-3">
                  <span className="badge bg-success" style={{ fontSize: '1.5rem', padding: '10px 15px' }}>
                    2
                  </span>
                </div>
                <Card.Title>Enter Farm Details</Card.Title>
                <Card.Text>
                  Provide information about your farm including location, field size, soil type, and current conditions.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col md={6} className="mb-3">
            <Card className="shadow-sm h-100">
              <Card.Body>
                <div className="mb-3">
                  <span className="badge bg-success" style={{ fontSize: '1.5rem', padding: '10px 15px' }}>
                    3
                  </span>
                </div>
                <Card.Title>Provide Environmental Data</Card.Title>
                <Card.Text>
                  Input current weather conditions, seasonal patterns, rainfall data, and any other environmental factors
                  affecting your crop.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} className="mb-3">
            <Card className="shadow-sm h-100">
              <Card.Body>
                <div className="mb-3">
                  <span className="badge bg-success" style={{ fontSize: '1.5rem', padding: '10px 15px' }}>
                    4
                  </span>
                </div>
                <Card.Title>Get AI Predictions</Card.Title>
                <Card.Text>
                  Our advanced AI models analyze your data and provide accurate yield predictions for your paddy crop.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col md={6} className="mx-auto">
            <Card className="shadow-sm h-100">
              <Card.Body>
                <div className="mb-3">
                  <span className="badge bg-success" style={{ fontSize: '1.5rem', padding: '10px 15px' }}>
                    5
                  </span>
                </div>
                <Card.Title>Receive Recommendations</Card.Title>
                <Card.Text>
                  Get actionable insights and recommendations to optimize your farming practices and maximize yield.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <h2 className="mt-5 mb-4">Key Features</h2>
        <Row>
          <Col md={6} className="mb-3">
            <h5>🔍 Accurate Predictions</h5>
            <p>Machine learning models trained on extensive agricultural data provide highly accurate yield predictions.</p>
          </Col>
          <Col md={6} className="mb-3">
            <h5>📊 Historical Analysis</h5>
            <p>Track your prediction history and compare actual yields with predictions to improve accuracy over time.</p>
          </Col>
        </Row>

        <Row>
          <Col md={6} className="mb-3">
            <h5>💡 Smart Recommendations</h5>
            <p>Receive personalized recommendations based on your farm conditions and crop requirements.</p>
          </Col>
          <Col md={6} className="mb-3">
            <h5>🔒 Secure & Private</h5>
            <p>All your farm data is encrypted and kept private. We respect your privacy and data security.</p>
          </Col>
        </Row>

        <div className="mt-5 p-4 bg-light rounded">
          <h3>Ready to get started?</h3>
          <p>Join thousands of farmers already using Smart Paddy Advisor to improve their yields and productivity.</p>
          <Button variant="success" size="lg" onClick={handleRegister}>
            Sign Up Now
          </Button>
        </div>
      </Container>

      {/* Footer */}
      <footer className="bg-dark text-white py-3 mt-5">
        <Container className="text-center">
          <small>© {new Date().getFullYear()} Smart Paddy Advisor. All rights reserved.</small>
        </Container>
      </footer>
    </>
  );
}
