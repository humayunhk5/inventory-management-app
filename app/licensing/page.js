'use client';

import { useState } from 'react';
import { generateLicenseKey, getLicenseExpiryDate, getDaysRemaining, createLicense, validateLicense } from '../license-utils';

export default function LicensingPage() {
  const [licenses, setLicenses] = useState([
    {
      licenseKey: 'BIZ-5555-A7X9K2-26',
      phoneNumber: '+966500111222',
      businessName: 'Tariq Store',
      email: 'tariq@example.com',
      createdDate: '2026-09-15T10:30:00Z',
      expiryDate: '2027-09-15T10:30:00Z',
      planType: 'yearly',
      planPrice: 9,
      status: 'active',
      paymentId: 'pay_001',
    },
    {
      licenseKey: 'BIZ-3344-M4N8P5-26',
      phoneNumber: '+966500333444',
      businessName: 'Blue Mart',
      email: 'blue@example.com',
      createdDate: '2026-08-20T14:45:00Z',
      expiryDate: '2027-08-20T14:45:00Z',
      planType: 'yearly',
      planPrice: 9,
      status: 'active',
      paymentId: 'pay_002',
    },
  ]);

  const [newUser, setNewUser] = useState({
    phoneNumber: '',
    businessName: '',
    email: '',
  });

  const [paymentForm, setPaymentForm] = useState({
    amount: '9.00',
    currency: 'USD',
    method: 'stripe',
  });

  const handleCreateLicense = (event) => {
    event.preventDefault();
    
    if (!newUser.phoneNumber || !newUser.businessName || !newUser.email) {
      alert('Please fill all fields');
      return;
    }

    // Create new license
    const license = createLicense({
      ...newUser,
      paymentId: `pay_${Date.now()}`,
    });

    setLicenses([license, ...licenses]);
    setNewUser({ phoneNumber: '', businessName: '', email: '' });
    alert(`License created: ${license.licenseKey}`);
  };

  const revokeLicense = (licenseKey) => {
    setLicenses(licenses.map(l => 
      l.licenseKey === licenseKey ? { ...l, status: 'revoked' } : l
    ));
  };

  const renewLicense = (licenseKey) => {
    setLicenses(licenses.map(l => {
      if (l.licenseKey === licenseKey) {
        return {
          ...l,
          expiryDate: getLicenseExpiryDate().toISOString(),
          status: 'active',
        };
      }
      return l;
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const totalRevenue = licenses.filter(l => l.status === 'active').length * 9;
  const activeCount = licenses.filter(l => l.status === 'active').length;
  const revokedCount = licenses.filter(l => l.status === 'revoked').length;

  return (
    <div className="licensing-page">
      <header className="licensing-header">
        <div>
          <h1>License Management</h1>
          <p>Manage yearly $9 licenses for BizStock users</p>
        </div>
      </header>

      <div className="licensing-stats">
        <div className="stat-box">
          <span>Active Licenses</span>
          <strong>{activeCount}</strong>
        </div>
        <div className="stat-box">
          <span>Annual Revenue</span>
          <strong>${totalRevenue}</strong>
        </div>
        <div className="stat-box">
          <span>Revoked Licenses</span>
          <strong>{revokedCount}</strong>
        </div>
        <div className="stat-box">
          <span>Total Users</span>
          <strong>{licenses.length}</strong>
        </div>
      </div>

      <div className="licensing-content">
        <div className="form-section card">
          <h3>Create New License</h3>
          <p className="description">When payment is received, generate a new license automatically</p>
          
          <form onSubmit={handleCreateLicense}>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                placeholder="+966 50 XXXX XXXX"
                value={newUser.phoneNumber}
                onChange={(e) => setNewUser({ ...newUser, phoneNumber: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Business Name</label>
              <input
                type="text"
                placeholder="Your shop or business name"
                value={newUser.businessName}
                onChange={(e) => setNewUser({ ...newUser, businessName: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="user@example.com"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
            </div>

            <div className="payment-box">
              <div className="payment-item">
                <span>Annual Plan</span>
                <strong>${paymentForm.amount}</strong>
              </div>
              <div className="payment-item">
                <span>Payment Method</span>
                <span className="badge">{paymentForm.method.toUpperCase()}</span>
              </div>
            </div>

            <button type="submit" className="primary-btn full-width">Generate License & Process Payment</button>
          </form>
        </div>

        <div className="licenses-section card">
          <h3>Active Licenses</h3>
          <p className="description">All licenses and their status</p>
          
          <div className="licenses-table">
            <table>
              <thead>
                <tr>
                  <th>License Key</th>
                  <th>Business Name</th>
                  <th>Phone</th>
                  <th>Created</th>
                  <th>Expires</th>
                  <th>Days Left</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {licenses.map((license) => {
                  const daysLeft = getDaysRemaining(license.expiryDate);
                  return (
                    <tr key={license.licenseKey} className={`license-row status-${license.status}`}>
                      <td className="license-key">
                        <code>{license.licenseKey}</code>
                      </td>
                      <td>{license.businessName}</td>
                      <td>{license.phoneNumber}</td>
                      <td>{formatDate(license.createdDate)}</td>
                      <td>{formatDate(license.expiryDate)}</td>
                      <td>
                        <span className={`days-badge ${daysLeft < 30 ? 'warning' : 'normal'}`}>
                          {daysLeft} days
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${license.status}`}>
                          {license.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="actions">
                        {license.status === 'active' ? (
                          <>
                            <button className="btn-renew" onClick={() => renewLicense(license.licenseKey)}>Renew</button>
                            <button className="btn-revoke" onClick={() => revokeLicense(license.licenseKey)}>Revoke</button>
                          </>
                        ) : (
                          <button className="btn-small" disabled>Revoked</button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
