import React from 'react';
import { Container, Navbar, Nav, Button, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
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
          <Navbar.Brand onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>🌾 Smart Paddy Advisor</Navbar.Brand>
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

      {/* Hero section */}
      <Container className="text-center my-5">
        <h1>Welcome to Smart Paddy Advisor</h1>
        <p>Your AI powered tool for optimal paddy yield prediction and advice.</p>
        <Button variant="success" size="lg" onClick={handleRegister}>
          Get Started
        </Button>
      </Container>

      {/* About section */}
      <Container className="my-5">
        <h2>About</h2>
        <p>
          Smart Paddy Advisor helps farmers predict paddy yield based on multiple parameters
          including weather, soil conditions, and historical data. Our platform provides
          personalized recommendations to increase productivity and reduce waste.
        </p>
        <Button variant="outline-success" onClick={() => navigate('/about')}>Learn More</Button>
      </Container>

      {/* How it works */}
      <Container className="my-5">
        <h2>How it works</h2>
        <p>
          Follow our simple 5-step process to get started with yield predictions and smart
          recommendations for your paddy farm.
        </p>
        <ol>
          <li>Create an account or login.</li>
          <li>Provide details about your field and current conditions.</li>
          <li>Receive yield predictions and actionable advice.</li>
        </ol>
        <Button variant="outline-success" onClick={() => navigate('/how-it-works')}>See Full Details</Button>
      </Container>

      {/* Contact section */}
      <Container className="my-5">
        <h2>Contact Us</h2>
        <p>Have questions or need support? We're here to help. Get in touch with our team anytime.</p>
        <Button variant="outline-success" onClick={() => navigate('/contact')}>Contact Us</Button>
      </Container>

      {/* Footer */}
      <footer className="bg-dark text-white py-3">
        <Container className="text-center">
          <small>© {new Date().getFullYear()} Smart Paddy Advisor. All rights reserved.</small>
        </Container>
      </footer>
    </>
  );
}
