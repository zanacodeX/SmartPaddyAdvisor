import React, { useState } from 'react';
import { Container, Navbar, Nav, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

export default function ContactPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleLogin = () => {
    navigate('/login');
  };

  const handleRegister = () => {
    navigate('/register');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
    setTimeout(() => setSubmitted(false), 5000);
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

      {/* Contact Content */}
      <Container className="my-5">
        <h1>Contact Us</h1>
        <p className="lead">
          Have questions? We'd love to hear from you. Get in touch with our team today.
        </p>

        <Row className="mt-5">
          {/* Contact Information */}
          <Col md={6} className="mb-4">
            <h2>Get In Touch</h2>
            <div className="mb-4">
              <h5>📍 Address</h5>
              <p>
                Smart Paddy Advisor<br />
                Agricultural Tec Hub<br />
                Rathnapura<br />
                Sri Lanka
              </p>
            </div>

            <div className="mb-4">
              <h5>📞 Phone</h5>
              <p>
                <a href="tel:+94767714341">+94 76 771 4341</a><br />
                <a href="tel:+94773419080">+94 77 341 9080</a> (Mobile)
              </p>
            </div>

            <div className="mb-4">
              <h5>📧 Email</h5>
              <p>
                <a href="mailto:support@smartpaddy.com">support@smartpaddy.com</a><br />
                <a href="mailto:info@smartpaddy.com">info@smartpaddy.com</a>
              </p>
            </div>

            <div className="mb-4">
              <h5>⏰ Business Hours</h5>
              <p>
                Monday - Friday: 8:00 AM - 5:00 PM<br />
                Saturday: 9:00 AM - 1:00 PM<br />
                Sunday: Closed
              </p>
            </div>

            <div>
              <h5>🔗 Follow Us</h5>
              <p>
                <a href="#facebook" className="btn btn-sm btn-primary me-2">Facebook</a>
                <a href="#twitter" className="btn btn-sm btn-info me-2">Twitter</a>
                <a href="#instagram" className="btn btn-sm btn-danger me-2">Instagram</a>
                <a href="#linkedin" className="btn btn-sm btn-secondary">LinkedIn</a>
              </p>
            </div>
          </Col>

          {/* Contact Form */}
          <Col md={6} className="mb-4">
            <h2>Send us a Message</h2>
            {submitted && (
              <Alert variant="success" onClose={() => setSubmitted(false)} dismissible>
                Thank you for your message! We'll get back to you soon.
              </Alert>
            )}
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Full Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter your full name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email Address</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter your email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Subject</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="What is this about?"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Message</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  placeholder="Enter your message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>

              <Button variant="success" type="submit" size="lg">
                Send Message
              </Button>
            </Form>
          </Col>
        </Row>

        <hr className="my-5" />

        <Row>
          <Col md={4} className="text-center mb-4">
            <h5>❓ FAQ</h5>
            <p>Have common questions? Check our FAQ section for quick answers.</p>
            <Button variant="outline-success">View FAQ</Button>
          </Col>
          <Col md={4} className="text-center mb-4">
            <h5>📚 Knowledge Base</h5>
            <p>Browse our comprehensive knowledge base and documentation.</p>
            <Button variant="outline-success">Knowledge Base</Button>
          </Col>
          <Col md={4} className="text-center mb-4">
            <h5>💬 Live Chat</h5>
            <p>Chat with our support team in real-time for immediate assistance.</p>
            <Button variant="outline-success">Start Chat</Button>
          </Col>
        </Row>
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
