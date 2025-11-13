import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Navbar, Nav, Button, Card, Alert, Form } from 'react-bootstrap';
import axiosInstance from '../api/axiosInstance';
import PredictionForm from '../component/PredictionForm'; 
import PredictionHistory from "../component/PredictionHistory";

export default function UserPortal() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [activeTab, setActiveTab] = useState('prediction');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <>
      {/* Navbar */}
      <Navbar bg="success" variant="dark" sticky="top">
        <Container>
          <Navbar.Brand>🌾 Smart Paddy Advisor</Navbar.Brand>
          <Nav className="ms-auto">
            <span className="text-white me-3">Welcome, {user.email}</span>
            <Button variant="outline-light" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </Nav>
        </Container>
      </Navbar>

      {/* Main Content */}
      <Container className="mt-5">
        {/* Tab Navigation */}
        <div className="mb-4">
          <Button
            variant={activeTab === 'prediction' ? 'success' : 'outline-success'}
            className="me-2"
            onClick={() => setActiveTab('prediction')}
          >
            Make Prediction
          </Button>
          <Button
            variant={activeTab === 'history' ? 'success' : 'outline-success'}
            onClick={() => setActiveTab('history')}
          >
            Prediction History
          </Button>
        </div>

        {/* Tab Content */}
        {activeTab === 'prediction' && (
          <Card className="shadow">
            <Card.Header className="bg-success text-white">
              <h5 className="mb-0">Paddy Yield Prediction</h5>
            </Card.Header>
            <Card.Body>
              <PredictionForm />
            </Card.Body>
          </Card>
        )}

        {activeTab === 'history' && (
          <Card className="shadow">
            <Card.Header className="bg-success text-white">
              <h5 className="mb-0">Your Prediction History</h5>
            </Card.Header>
            <Card.Body>
              <PredictionHistory />
            </Card.Body>
          </Card>
        )}
      </Container>
    </>
  );
}