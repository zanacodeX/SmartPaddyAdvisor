import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Navbar, Nav, Button, Card, Modal, Spinner } from 'react-bootstrap';
import axiosInstance from '../api/axiosInstance';

const TOKEN = {
  dark900: "#0d1117",
  dark700: "#161b22",
  dark500: "#21262d",
  green700: "#1a6b2f",
  green500: "#2d9e50",
  green100: "#e8f5ec",
  border: "#30363d",
  borderLight: "#cce5d4",
  white: "#ffffff",
  muted: "#8b949e",
  ink: "#e6edf3",
  danger: "#c62828",
  dangerLight: "#fff5f5",
  warn: "#f57c00",
  warnLight: "#fff8e1",
  blue: "#1565c0",
  blueLight: "#e3f2fd",
};

export default function AdminPortal() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [roleLoading, setRoleLoading] = useState(null);
  const [toast, setToast] = useState('');
  const [editTarget, setEditTarget]   = useState(null);  // holds user object being edited
  const [editForm, setEditForm]       = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError]     = useState('');

  useEffect(() => { fetchUsers(); }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axiosInstance.get('/auth/admin/users');
      setUsers(res.data.users || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await axiosInstance.delete(`/auth/admin/users/${deleteTarget}`);
      setUsers(prev => prev.filter(u => u.id !== deleteTarget));
      setDeleteTarget(null);
      showToast('User deleted successfully.');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete user.');
    } finally {
      setDeleting(false);
    }
  };

  const handleRoleToggle = async (targetUser) => {
    const newRole = targetUser.role === 'admin' ? 'user' : 'admin';
    setRoleLoading(targetUser.id);
    try {
      await axiosInstance.put(`/auth/admin/users/${targetUser.id}/role`, { role: newRole });
      setUsers(prev => prev.map(u => u.id === targetUser.id ? { ...u, role: newRole } : u));
      showToast(`${targetUser.email} is now ${newRole}.`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update role.');
    } finally {
      setRoleLoading(null);
    }
  };

  const openEdit = (u) => {
    setEditTarget(u);
    setEditForm({ name: u.name || '', email: u.email || '', phone: u.phone || '', location: u.location || '' });
    setEditError('');
  };

  const handleEditSave = async () => {
    if (!editTarget) return;
    setEditLoading(true);
    setEditError('');
    try {
      const res = await axiosInstance.put(`/auth/admin/users/${editTarget.id}`, editForm);
      setUsers(prev => prev.map(u => u.id === editTarget.id ? res.data.user : u));
      setEditTarget(null);
      showToast(`${editForm.name || editForm.email} updated successfully.`);
    } catch (err) {
      setEditError(err.response?.data?.error || 'Failed to update user.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const filtered = users.filter(u =>
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const adminCount = users.filter(u => u.role === 'admin').length;
  const userCount  = users.filter(u => u.role === 'user').length;

  return (
    <div style={{ minHeight: '100vh', background: '#f4fbf6', fontFamily: "'Georgia', serif" }}>
      <style>{`
        @keyframes fadeSlideIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes toastIn { from{opacity:0;transform:translateX(40px)} to{opacity:1;transform:translateX(0)} }
        .admin-row { transition: background 0.15s; }
        .admin-row:hover { background: #f4fbf6 !important; }
        .action-btn { border:none; cursor:pointer; font-size:12px; font-weight:600;
          padding:6px 14px; border-radius:20px; transition:all 0.18s; letter-spacing:0.3px; }
        .action-btn:hover { filter:brightness(1.1); transform:scale(1.04); }
        .tab-btn { border:none; cursor:pointer; font-weight:600; font-size:13px;
          padding:8px 20px; border-radius:20px; transition:all 0.2s; letter-spacing:0.3px;
          font-family:'Georgia',serif; }
        .search-input:focus { outline:none; border-color:#2d9e50 !important;
          box-shadow:0 0 0 3px rgba(45,158,80,0.15) !important; }
      `}</style>

      {/* Navbar */}
      <nav style={{
        background: `linear-gradient(135deg, ${TOKEN.dark900}, ${TOKEN.dark700})`,
        padding: '0 24px', height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>🌾</span>
          <span style={{ color: TOKEN.white, fontWeight: 700, fontSize: 16, letterSpacing: 0.3 }}>
            Smart Paddy Advisor
          </span>
          <span style={{
            background: TOKEN.danger, color: '#fff',
            fontSize: 10, fontWeight: 700, padding: '2px 8px',
            borderRadius: 20, marginLeft: 6, letterSpacing: 0.5,
          }}>ADMIN</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ color: TOKEN.muted, fontSize: 13 }}>
            👤 {user.name || user.email}
          </span>
          <button className="action-btn"
            style={{ background: 'rgba(255,255,255,0.1)', color: TOKEN.white, border: '1px solid rgba(255,255,255,0.2)' }}
            onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 72, right: 24, zIndex: 999,
          background: TOKEN.green700, color: '#fff',
          padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600,
          boxShadow: '0 4px 16px rgba(27,94,32,0.3)',
          animation: 'toastIn 0.3s ease',
        }}>
          ✅ {toast}
        </div>
      )}

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px' }}>

        {/* Page header */}
        <div style={{ marginBottom: 28 }}>
          <h4 style={{ margin: 0, color: TOKEN.green700, fontWeight: 700, fontSize: 22 }}>
            Admin Dashboard
          </h4>
          <p style={{ margin: '4px 0 0', color: TOKEN.muted, fontSize: 13 }}>
            Manage users, view prediction logs and configure settings
          </p>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 14, marginBottom: 28, flexWrap: 'wrap' }}>
          {[
            { label: 'Total Users', value: users.length, icon: '👥', color: TOKEN.green700, bg: TOKEN.green100 },
            { label: 'Admins', value: adminCount, icon: '🛡️', color: TOKEN.danger, bg: TOKEN.dangerLight },
            { label: 'Regular Users', value: userCount, icon: '🌾', color: TOKEN.blue, bg: TOKEN.blueLight },
          ].map(s => (
            <div key={s.label} style={{
              background: s.bg, border: `1px solid ${TOKEN.borderLight}`,
              borderRadius: 12, padding: '14px 22px',
              display: 'flex', alignItems: 'center', gap: 14, minWidth: 160,
              animation: 'fadeSlideIn 0.3s ease',
            }}>
              <span style={{ fontSize: 26 }}>{s.icon}</span>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: TOKEN.muted, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tab buttons */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
          {[
            { key: 'users', label: '👥 Manage Users' },
            { key: 'logs',  label: '📊 Prediction Logs' },
            { key: 'settings', label: '⚙️ Settings' },
          ].map(tab => (
            <button key={tab.key} className="tab-btn"
              style={{
                background: activeTab === tab.key
                  ? `linear-gradient(135deg, ${TOKEN.green700}, ${TOKEN.green500})`
                  : TOKEN.white,
                color: activeTab === tab.key ? TOKEN.white : TOKEN.muted,
                border: `1px solid ${activeTab === tab.key ? 'transparent' : TOKEN.borderLight}`,
                boxShadow: activeTab === tab.key ? '0 4px 12px rgba(27,94,32,0.25)' : 'none',
              }}
              onClick={() => setActiveTab(tab.key)}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: TOKEN.dangerLight, border: `1px solid #ffcdd2`,
            color: TOKEN.danger, borderRadius: 10, padding: '10px 16px',
            fontSize: 13, marginBottom: 16,
          }}>
            ⚠️ {error}
            <button onClick={() => setError('')}
              style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', color: TOKEN.danger, fontWeight: 700 }}>✕</button>
          </div>
        )}

        {/* ── USERS TAB ── */}
        {activeTab === 'users' && (
          <div style={{
            background: TOKEN.white, borderRadius: 16,
            border: `1px solid ${TOKEN.borderLight}`,
            boxShadow: '0 4px 18px rgba(27,94,32,0.08)',
            overflow: 'hidden',
            animation: 'fadeSlideIn 0.3s ease',
          }}>
            {/* Card header */}
            <div style={{
              background: `linear-gradient(135deg, #0d3d1a, ${TOKEN.green700})`,
              padding: '16px 24px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <h6 style={{ margin: 0, color: TOKEN.white, fontWeight: 700, fontSize: 15 }}>Manage Users</h6>
                <p style={{ margin: '2px 0 0', color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
                  {filtered.length} of {users.length} users shown
                </p>
              </div>
              <button className="action-btn"
                style={{ background: 'rgba(255,255,255,0.15)', color: TOKEN.white, border: '1px solid rgba(255,255,255,0.25)' }}
                onClick={fetchUsers}>
                🔄 Refresh
              </button>
            </div>

            {/* Search bar */}
            <div style={{ padding: '16px 24px', borderBottom: `1px solid ${TOKEN.borderLight}`, background: '#fafffe' }}>
              <input
                className="search-input"
                placeholder="🔍  Search by name, email or location…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%', padding: '9px 14px',
                  borderRadius: 10, border: `1.5px solid ${TOKEN.borderLight}`,
                  fontSize: 13, fontFamily: "'Georgia', serif",
                  background: TOKEN.white, color: TOKEN.ink === '#e6edf3' ? '#1a2420' : TOKEN.ink,
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
              />
            </div>

            {/* Table */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', margin: '0 auto',
                  border: `3px solid ${TOKEN.green100}`, borderTop: `3px solid ${TOKEN.green500}`,
                  animation: 'spin 0.9s linear infinite',
                }} />
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                <p style={{ marginTop: 14, color: TOKEN.muted, fontSize: 13 }}>Loading users…</p>
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0', color: TOKEN.muted, fontSize: 14 }}>
                {searchQuery ? `No users matching "${searchQuery}"` : 'No users found.'}
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f4fbf6', borderBottom: `2px solid ${TOKEN.borderLight}` }}>
                      {['#', 'User', 'Contact', 'Location', 'Role', 'Actions'].map(h => (
                        <th key={h} style={{
                          padding: '12px 20px', textAlign: 'left',
                          fontSize: 11, fontWeight: 700, color: TOKEN.muted,
                          textTransform: 'uppercase', letterSpacing: 0.8,
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((u, i) => (
                      <tr key={u.id} className="admin-row"
                        style={{ borderBottom: `1px solid ${TOKEN.borderLight}` }}>

                        {/* # */}
                        <td style={{ padding: '14px 20px', color: TOKEN.muted, fontSize: 13 }}>{i + 1}</td>

                        {/* User */}
                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                              width: 36, height: 36, borderRadius: '50%',
                              background: u.role === 'admin'
                                ? `linear-gradient(135deg, ${TOKEN.danger}, #e57373)`
                                : `linear-gradient(135deg, ${TOKEN.green700}, ${TOKEN.green500})`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: '#fff', fontWeight: 700, fontSize: 13, flexShrink: 0,
                            }}>
                              {(u.name || u.email || '?')[0].toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: '#1a2420', fontSize: 14 }}>
                                {u.name || '—'}
                              </div>
                              <div style={{ fontSize: 12, color: TOKEN.muted }}>{u.email}</div>
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td style={{ padding: '14px 20px', fontSize: 13, color: '#1a2420' }}>
                          {u.phone || <span style={{ color: TOKEN.muted }}>—</span>}
                        </td>

                        {/* Location */}
                        <td style={{ padding: '14px 20px', fontSize: 13, color: '#1a2420' }}>
                          {u.location
                            ? <span>📍 {u.location}</span>
                            : <span style={{ color: TOKEN.muted }}>—</span>}
                        </td>

                        {/* Role badge */}
                        <td style={{ padding: '14px 20px' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '3px 12px', borderRadius: 20,
                            fontSize: 11, fontWeight: 700, letterSpacing: 0.4,
                            background: u.role === 'admin' ? TOKEN.dangerLight : TOKEN.green100,
                            color: u.role === 'admin' ? TOKEN.danger : TOKEN.green700,
                            border: `1px solid ${u.role === 'admin' ? '#ffcdd2' : TOKEN.borderLight}`,
                          }}>
                            {u.role === 'admin' ? '🛡️ Admin' : '🌾 User'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ display: 'flex', gap: 8 }}>
                            {/* Role toggle — can't change your own role */}
                            {u.id !== parseInt(user.id) && (
                              <button
                                className="action-btn"
                                style={{
                                  background: u.role === 'admin' ? TOKEN.warnLight : TOKEN.blueLight,
                                  color: u.role === 'admin' ? TOKEN.warn : TOKEN.blue,
                                  border: `1px solid ${u.role === 'admin' ? '#ffe082' : '#90caf9'}`,
                                  opacity: roleLoading === u.id ? 0.6 : 1,
                                }}
                                disabled={roleLoading === u.id}
                                onClick={() => handleRoleToggle(u)}
                              >
                                {roleLoading === u.id
                                  ? '…'
                                  : u.role === 'admin' ? '⬇️ Make User' : '⬆️ Make Admin'}
                              </button>
                            )}
                            {/* Edit button  */}
                              <button
                                className="action-btn"
                                style={{ background: TOKEN.green100, color: TOKEN.green700, border: `1px solid ${TOKEN.borderLight}` }}
                                onClick={() => openEdit(u)}
                              >
                                ✏️ Edit
                              </button>

                            

                            {/* Delete — can't delete yourself */}
                            {u.id !== parseInt(user.id) && (
                              <button
                                className="action-btn"
                                style={{ background: TOKEN.dangerLight, color: TOKEN.danger, border: '1px solid #ffcdd2' }}
                                onClick={() => setDeleteTarget(u.id)}
                              >
                                🗑 Delete
                              </button>
                            )}

                            {u.id === parseInt(user.id) && (
                              <span style={{ fontSize: 11, color: TOKEN.muted, padding: '6px 0' }}>You</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── LOGS TAB ── */}
        {activeTab === 'logs' && (
          <div style={{
            background: TOKEN.white, borderRadius: 16,
            border: `1px solid ${TOKEN.borderLight}`,
            boxShadow: '0 4px 18px rgba(27,94,32,0.08)',
            overflow: 'hidden', animation: 'fadeSlideIn 0.3s ease',
          }}>
            <div style={{ background: `linear-gradient(135deg, #0d3d1a, ${TOKEN.green700})`, padding: '16px 24px' }}>
              <h6 style={{ margin: 0, color: TOKEN.white, fontWeight: 700, fontSize: 15 }}>📊 Prediction Logs</h6>
            </div>
            <div style={{ padding: '48px 24px', textAlign: 'center', color: TOKEN.muted }}>
              <p style={{ fontSize: 36, margin: 0 }}>📊</p>
              <p style={{ marginTop: 12, fontSize: 14 }}>Prediction logs coming soon…</p>
            </div>
          </div>
        )}

        {/* ── SETTINGS TAB ── */}
        {activeTab === 'settings' && (
          <div style={{
            background: TOKEN.white, borderRadius: 16,
            border: `1px solid ${TOKEN.borderLight}`,
            boxShadow: '0 4px 18px rgba(27,94,32,0.08)',
            overflow: 'hidden', animation: 'fadeSlideIn 0.3s ease',
          }}>
            <div style={{ background: `linear-gradient(135deg, #0d3d1a, ${TOKEN.green700})`, padding: '16px 24px' }}>
              <h6 style={{ margin: 0, color: TOKEN.white, fontWeight: 700, fontSize: 15 }}>⚙️ Settings</h6>
            </div>
            <div style={{ padding: '48px 24px', textAlign: 'center', color: TOKEN.muted }}>
              <p style={{ fontSize: 36, margin: 0 }}>⚙️</p>
              <p style={{ marginTop: 12, fontSize: 14 }}>Settings coming soon…</p>
            </div>
          </div>
        )}
      </div>

      {/* ── DELETE CONFIRM MODAL ── */}
      <Modal show={!!deleteTarget} onHide={() => !deleting && setDeleteTarget(null)} centered size="sm">
        <Modal.Body style={{ padding: 32, textAlign: 'center', fontFamily: "'Georgia', serif" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🗑️</div>
          <h6 style={{ fontWeight: 700, color: '#1a2420', marginBottom: 8 }}>Delete User?</h6>
          <p style={{ color: TOKEN.muted, fontSize: 13, marginBottom: 24 }}>
            This user and all their data will be permanently removed.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button className="action-btn"
              style={{ background: TOKEN.danger, color: '#fff', padding: '8px 20px' }}
              onClick={handleDeleteConfirm} disabled={deleting}>
              {deleting ? 'Deleting…' : 'Yes, Delete'}
            </button>
            <button className="action-btn"
              style={{ background: TOKEN.white, color: TOKEN.muted, border: `1px solid ${TOKEN.borderLight}`, padding: '8px 20px' }}
              onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Cancel
            </button>
          </div>
        </Modal.Body>
      </Modal>
      {/* ── EDIT USER MODAL ── */}
      <Modal show={!!editTarget} onHide={() => !editLoading && setEditTarget(null)} centered>
        <Modal.Body style={{ padding: 0, fontFamily: "'Georgia', serif", borderRadius: 16, overflow: 'hidden' }}>

          {/* Modal header */}
          <div style={{
            background: `linear-gradient(135deg, #0d3d1a, ${TOKEN.green700})`,
            padding: '18px 24px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* Avatar */}
              <div style={{
                width: 38, height: 38, borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                border: '2px solid rgba(255,255,255,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 700, fontSize: 15,
              }}>
                {(editTarget?.name || editTarget?.email || '?')[0].toUpperCase()}
              </div>
              <div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>Edit User</div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>{editTarget?.email}</div>
              </div>
            </div>
            <button onClick={() => setEditTarget(null)}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', fontSize: 18, cursor: 'pointer' }}>
              ✕
            </button>
          </div>

          {/* Form body */}
          <div style={{ padding: '24px', background: TOKEN.white }}>
            {editError && (
              <div style={{
                background: TOKEN.dangerLight, border: '1px solid #ffcdd2',
                color: TOKEN.danger, borderRadius: 8, padding: '8px 14px',
                fontSize: 12, marginBottom: 16,
              }}>
                ⚠️ {editError}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[
                { key: 'name',     label: 'Full Name',     icon: '👤', placeholder: 'Enter full name' },
                { key: 'email',    label: 'Email Address', icon: '✉️', placeholder: 'Enter email' },
                { key: 'phone',    label: 'Phone Number',  icon: '📞', placeholder: '+94 XX XXX XXXX' },
                { key: 'location', label: 'Location',      icon: '📍', placeholder: 'District / Province' },
              ].map(field => (
                <div key={field.key}>
                  <label style={{
                    display: 'block', fontSize: 10, fontWeight: 700,
                    color: TOKEN.muted, textTransform: 'uppercase',
                    letterSpacing: 0.8, marginBottom: 5,
                  }}>
                    {field.icon} {field.label}
                  </label>
                  <input
                    value={editForm[field.key] || ''}
                    onChange={e => setEditForm({ ...editForm, [field.key]: e.target.value })}
                    placeholder={field.placeholder}
                    style={{
                      width: '100%', padding: '9px 12px',
                      borderRadius: 9, border: `1.5px solid ${TOKEN.borderLight}`,
                      fontSize: 13, fontFamily: "'Georgia', serif",
                      background: TOKEN.green50 || '#f4fbf6',
                      color: '#1a2420', boxSizing: 'border-box',
                      transition: 'border-color 0.2s',
                      outline: 'none',
                    }}
                    onFocus={e => e.target.style.borderColor = TOKEN.green500}
                    onBlur={e => e.target.style.borderColor = TOKEN.borderLight}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Modal footer */}
          <div style={{
            padding: '16px 24px', background: '#f4fbf6',
            borderTop: `1px solid ${TOKEN.borderLight}`,
            display: 'flex', gap: 10, justifyContent: 'flex-end',
          }}>
            <button className="action-btn"
              style={{ background: TOKEN.white, color: TOKEN.muted, border: `1px solid ${TOKEN.borderLight}`, padding: '8px 20px' }}
              onClick={() => setEditTarget(null)} disabled={editLoading}>
              Cancel
            </button>
            <button className="action-btn"
              style={{
                background: `linear-gradient(135deg, ${TOKEN.green700}, ${TOKEN.green500})`,
                color: '#fff', padding: '8px 22px',
                boxShadow: '0 4px 12px rgba(27,94,32,0.25)',
                opacity: editLoading ? 0.7 : 1,
              }}
              onClick={handleEditSave} disabled={editLoading}>
              {editLoading ? '💾 Saving…' : '💾 Save Changes'}
            </button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
    
  );
}