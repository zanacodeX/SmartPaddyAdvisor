import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Button, Form, Alert, Spinner } from 'react-bootstrap';
import axiosInstance from '../api/axiosInstance';

import axios from "axios";

export default function UserProfile({ onClose }) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [profileData, setProfileData] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    location: user.location || '',
    farmSize: user.farmSize || '',
    preferredCrop: user.preferredCrop || 'Paddy',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [activeSection, setActiveSection] = useState('info');

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleProfileSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await axiosInstance.put('/auth/update-profile', {
        name: profileData.name,
        phone: profileData.phone,
        location: profileData.location,
      });
      // Update localStorage with new data
      const updated = { ...user, ...res.data.user };
      localStorage.setItem('user', JSON.stringify(updated));
      setSuccess('Profile updated successfully!');
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSave = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await axiosInstance.put('/auth/change-password', {   // 👈 real API call
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setSuccess('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name, email) => {
    if (name) return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
    if (email) return email[0].toUpperCase();
    return 'U';
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif" }}>
      {/* Profile Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1a6b2f 0%, #2d9e50 60%, #52c878 100%)',
          borderRadius: '16px',
          padding: '32px 28px 24px',
          marginBottom: '24px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <div style={{
          position: 'absolute', top: -30, right: -30,
          width: 120, height: 120, borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)'
        }} />
        <div style={{
          position: 'absolute', bottom: -20, right: 60,
          width: 70, height: 70, borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)'
        }} />

        <div className="d-flex align-items-center gap-4">
          {/* Avatar */}
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'rgba(255,255,255,0.22)',
            border: '3px solid rgba(255,255,255,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, fontWeight: 700, color: '#fff',
            flexShrink: 0,
            backdropFilter: 'blur(6px)',
          }}>
            {getInitials(profileData.name, profileData.email)}
          </div>

          <div style={{ flex: 1 }}>
            <h4 style={{ color: '#fff', margin: 0, fontWeight: 700, fontSize: 22 }}>
              {profileData.name || 'Farmer'}
            </h4>
            <p style={{ color: 'rgba(255,255,255,0.8)', margin: '4px 0 8px', fontSize: 14 }}>
              {profileData.email}
            </p>
            <div className="d-flex gap-2 flex-wrap">
              <Badge bg="light" text="success" style={{ fontWeight: 600, fontSize: 11 }}>
                🌾 {profileData.preferredCrop} Farmer
              </Badge>
              {profileData.location && (
                <Badge bg="light" text="dark" style={{ fontWeight: 500, fontSize: 11 }}>
                  📍 {profileData.location}
                </Badge>
              )}
              {profileData.farmSize && (
                <Badge bg="light" text="dark" style={{ fontWeight: 500, fontSize: 11 }}>
                  🏡 {profileData.farmSize} acres
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="d-flex gap-2 mb-4">
        {[
          { key: 'info', label: '👤 Personal Info' },
          
          { key: 'security', label: '🔒 Security' },
        ].map((tab) => (
          <Button
            key={tab.key}
            size="sm"
            variant={activeSection === tab.key ? 'success' : 'outline-success'}
            style={{ borderRadius: 20, fontWeight: 600, fontSize: 13 }}
            onClick={() => { setActiveSection(tab.key); setError(''); setSuccess(''); }}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {success && <Alert variant="success" className="py-2">{success}</Alert>}
      {error && <Alert variant="danger" className="py-2">{error}</Alert>}

      {/* Personal Info Section */}
      {activeSection === 'info' && (
        <Card style={{ border: '1px solid #e2f0e8', borderRadius: 14 }}>
          <Card.Body className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 style={{ fontWeight: 700, color: '#1a6b2f', margin: 0 }}>Personal Information</h6>
              {!editing ? (
                <Button size="sm" variant="outline-success" style={{ borderRadius: 20 }} onClick={() => setEditing(true)}>
                  ✏️ Edit
                </Button>
              ) : (
                <div className="d-flex gap-2">
                  <Button size="sm" variant="outline-secondary" style={{ borderRadius: 20 }} onClick={() => setEditing(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" variant="success" style={{ borderRadius: 20 }} onClick={handleProfileSave} disabled={loading}>
                    {loading ? <Spinner size="sm" animation="border" /> : '💾 Save'}
                  </Button>
                </div>
              )}
            </div>

            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label style={{ fontSize: 12, fontWeight: 600, color: '#6c757d', textTransform: 'uppercase' }}>Full Name</Form.Label>
                  {editing ? (
                    <Form.Control name="name" value={profileData.name} onChange={handleProfileChange} placeholder="Enter your name" style={{ borderRadius: 10 }} />
                  ) : (
                    <div style={{ padding: '8px 0', fontWeight: 600, color: '#212529' }}>{profileData.name || <span style={{ color: '#adb5bd' }}>Not set</span>}</div>
                  )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label style={{ fontSize: 12, fontWeight: 600, color: '#6c757d', textTransform: 'uppercase' }}>Email Address</Form.Label>
                  <div style={{ padding: '8px 0', fontWeight: 600, color: '#212529' }}>{profileData.email}</div>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label style={{ fontSize: 12, fontWeight: 600, color: '#6c757d', textTransform: 'uppercase' }}>Phone Number</Form.Label>
                  {editing ? (
                    <Form.Control name="phone" value={profileData.phone} onChange={handleProfileChange} placeholder="+94 XX XXX XXXX" style={{ borderRadius: 10 }} />
                  ) : (
                    <div style={{ padding: '8px 0', fontWeight: 600, color: '#212529' }}>{profileData.phone || <span style={{ color: '#adb5bd' }}>Not set</span>}</div>
                  )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label style={{ fontSize: 12, fontWeight: 600, color: '#6c757d', textTransform: 'uppercase' }}>Location</Form.Label>
                  {editing ? (
                    <Form.Control name="location" value={profileData.location} onChange={handleProfileChange} placeholder="District / Province" style={{ borderRadius: 10 }} />
                  ) : (
                    <div style={{ padding: '8px 0', fontWeight: 600, color: '#212529' }}>{profileData.location || <span style={{ color: '#adb5bd' }}>Not set</span>}</div>
                  )}
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}



      {/* Security Section */}
      {activeSection === 'security' && (
        <Card style={{ border: '1px solid #e2f0e8', borderRadius: 14 }}>
          <Card.Body className="p-4">
            <h6 style={{ fontWeight: 700, color: '#1a6b2f', marginBottom: 20 }}>Change Password</h6>
            <Row className="g-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label style={{ fontSize: 12, fontWeight: 600, color: '#6c757d', textTransform: 'uppercase' }}>Current Password</Form.Label>
                  <Form.Control type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} placeholder="Enter current password" style={{ borderRadius: 10 }} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label style={{ fontSize: 12, fontWeight: 600, color: '#6c757d', textTransform: 'uppercase' }}>New Password</Form.Label>
                  <Form.Control type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} placeholder="Enter new password" style={{ borderRadius: 10 }} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label style={{ fontSize: 12, fontWeight: 600, color: '#6c757d', textTransform: 'uppercase' }}>Confirm Password</Form.Label>
                  <Form.Control type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} placeholder="Confirm new password" style={{ borderRadius: 10 }} />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Button variant="success" style={{ borderRadius: 20, fontWeight: 600 }} onClick={handlePasswordSave} disabled={loading}>
                  {loading ? <Spinner size="sm" animation="border" /> : '🔒 Update Password'}
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}
    </div>
  );
}
