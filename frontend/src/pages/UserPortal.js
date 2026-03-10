import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Navbar, Nav, Button, Card, Alert, Form, Modal } from 'react-bootstrap'; 
import axiosInstance from '../api/axiosInstance';
import PredictionForm from '../component/PredictionForm'; 
import PredictionHistory from "../component/PredictionHistory";
import DiseaseDetection from '../component/DiseaseDetection';
import UserProfile from '../component/UserProfile'; 

export default function UserPortal() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [activeTab, setActiveTab] = useState('prediction');
  const [showProfileModal, setShowProfileModal] = useState(false); 

  
  const getInitials = (name, email) => {
    if (name) return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
    if (email) return email[0].toUpperCase();
    return 'U';
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <>
      {/* Navbar */}
      <Navbar bg="success" variant="dark" sticky="top">
        <Container>
          <Navbar.Brand>🌾 Smart Paddy Advisor</Navbar.Brand>
          <Nav className="ms-auto d-flex align-items-center gap-2">

            {/* Replaced <span> with clickable avatar pill */}
            <div
              onClick={() => setShowProfileModal(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                cursor: 'pointer', padding: '6px 14px', borderRadius: 50,
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.3)',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
              title="View Profile"
            >
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'rgba(255,255,255,0.3)',
                border: '2px solid rgba(255,255,255,0.7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0,
              }}>
                {getInitials(user.name, user.email)}
              </div>
              <span style={{ color: '#fff', fontSize: 14, fontWeight: 500 }}>
                {user.name || user.email}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>▾</span>
            </div>
            {/* */}

            <Button variant="outline-light" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </Nav>
        </Container>
      </Navbar>

      {/* Main Content  */}
      <Container className="mt-5">
        <div className="mb-4">
          <Button
            variant={activeTab === 'prediction' ? 'success' : 'outline-success'}
            className="me-2"
            onClick={() => setActiveTab('prediction')}
          >
            Make Prediction
          </Button>
          <Button
            variant={activeTab === 'detection' ? 'success' : 'outline-success'}
            className="me-2"
            onClick={() => setActiveTab('detection')}
          >
            Disease Detection
          </Button>
          <Button
            variant={activeTab === 'history' ? 'success' : 'outline-success'}
            onClick={() => setActiveTab('history')}
          >
            Prediction History
          </Button>
        </div>

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

        {activeTab === 'detection' && (
          <Card className="shadow">
            <Card.Body>
              <DiseaseDetection />
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

      {/*Profile Modal  </> */}
      <Modal
        show={showProfileModal}
        onHide={() => setShowProfileModal(false)}
        size="lg"
        centered
        scrollable
      >
        <Modal.Header
          closeButton
          style={{
            background: 'linear-gradient(135deg, #1a6b2f, #2d9e50)',
            borderBottom: 'none',
            padding: '16px 24px',
          }}
        >
          <Modal.Title style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>
            👤 My Profile
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: '#f8fdf9', padding: '24px' }}>
          <UserProfile onClose={() => setShowProfileModal(false)} />
        </Modal.Body>
      </Modal>
      {/**/}

    </>
  );
}