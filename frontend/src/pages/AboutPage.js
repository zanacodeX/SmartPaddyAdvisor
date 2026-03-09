import React from 'react';
import { Container, Navbar, Nav, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

export default function AboutPage() {
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

      {/* About Content */}
      <Container className="my-5">
        <h1>About Smart Paddy Advisor</h1>
        <p className="lead">
          Smart Paddy Advisor is an innovative AI-powered platform designed to transform paddy farming
          through data-driven insights and predictive analytics.
        </p>

        <h2 className="mt-5">Our Mission</h2>
        <p>
          Our mission is to empower farmers with cutting-edge technology to make informed decisions
          about their paddy cultivation, maximize yields, and improve sustainability.
        </p>

        <h2 className="mt-5">What We Do</h2>
        <p>
          We leverage machine learning algorithms to analyze various factors including:
        </p>
        <ul>
          <li>Predict yield Results </li>
          <li>Soil composition and nutrients</li>
          <li>Historical Predict data save and view </li>
          <li>Farming practices and techniques</li>
          <li>Detect disease Using Images</li>
        </ul>

        <h2 className="mt-5">Our Vision</h2>
        <p>
          We envision a future where every farmer, regardless of location or resources, has access to
          advanced agricultural intelligence to achieve optimal crop yields while maintaining
          environmental sustainability.
        </p>

        <h2 className="mt-5">Why Choose Us?</h2>
        <ul>
          <li><strong>AI-Powered Insights:</strong> Advanced machine learning models for accurate predictions</li>
          <li><strong>User-Friendly:</strong> Simple, intuitive interface designed for farmers of all tech levels</li>
          <li><strong>Data Security:</strong> Your farm data is encrypted and protected</li>
          <li><strong>24/7 Support:</strong> Dedicated customer support to help you succeed</li>
          <li><strong>Continuous Improvement:</strong> Regular updates with latest agricultural research</li>
        </ul>

        <h2 className="mt-5">Our Team</h2>
        <p>
          Our team consists of agricultural experts, data scientists, and software engineers committed
          to bringing innovation to the farming industry.
        </p>
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
