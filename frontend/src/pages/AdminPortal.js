import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Navbar, Nav, Button, Card, Table } from 'react-bootstrap';
import axiosInstance from '../api/axiosInstance';

export default function AdminPortal() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get('/admin/users');
      setUsers(response.data.users || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <>
      {/* Navbar */}
      <Navbar bg="dark" variant="dark" sticky="top">
        <Container>
          <Navbar.Brand>🌾 Smart Paddy Advisor - Admin</Navbar.Brand>
          <Nav className="ms-auto">
            <span className="text-white me-3">Admin: {user.email}</span>
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
            variant={activeTab === 'users' ? 'primary' : 'outline-primary'}
            className="me-2"
            onClick={() => setActiveTab('users')}
          >
            Manage Users
          </Button>
          <Button
            variant={activeTab === 'logs' ? 'primary' : 'outline-primary'}
            className="me-2"
            onClick={() => setActiveTab('logs')}
          >
            Prediction Logs
          </Button>
          <Button
            variant={activeTab === 'settings' ? 'primary' : 'outline-primary'}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </Button>
        </div>

        {/* Tab Content */}
        {activeTab === 'users' && (
          <Card className="shadow">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">Manage Users</h5>
            </Card.Header>
            <Card.Body>
              {users.length > 0 ? (
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td>{u.id}</td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`badge bg-${u.role === 'admin' ? 'danger' : 'success'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td>
                          <Button size="sm" variant="warning">
                            Edit
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-muted">No users found.</p>
              )}
            </Card.Body>
          </Card>
        )}

        {activeTab === 'logs' && (
          <Card className="shadow">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">Prediction Logs</h5>
            </Card.Header>
            <Card.Body>
              <p className="text-muted">Prediction logs coming soon...</p>
            </Card.Body>
          </Card>
        )}

        {activeTab === 'settings' && (
          <Card className="shadow">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">Settings</h5>
            </Card.Header>
            <Card.Body>
              <p className="text-muted">Settings coming soon...</p>
            </Card.Body>
          </Card>
        )}
      </Container>
    </>
  );
}