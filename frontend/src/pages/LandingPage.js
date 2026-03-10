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
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
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
      <Container className="text-center my-5" style={{ flex: 1 }}>
        <h1>Welcome to Smart Paddy Advisor</h1>
        <p>Your AI powered tool for optimal paddy yield prediction and advice.</p>
        <Button variant="success" size="lg" onClick={handleRegister}>
          Get Started
        </Button>
      </Container>

      
      {/* Footer */}
      <footer className="bg-dark text-white py-3">
        <Container className="text-center">
          <small>© {new Date().getFullYear()} Smart Paddy Advisor. All rights reserved.</small>
        </Container>
      </footer>
      </div>
  );
}
