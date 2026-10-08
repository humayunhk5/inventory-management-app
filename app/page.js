'use client';

import { useEffect, useMemo, useState } from 'react';
import { createLicense, getDaysRemaining, getLicenseExpiryDate } from './license-utils';
import '../styles/licensing.css';

const initialProducts = [
  { id: 1, name: 'Rice 25kg', category: 'Groceries', sku: 'RICE-001', stock: 42, unit: 'Bag', buyPrice: 1400, sellPrice: 1900, location: 'Warehouse A' },
  { id: 2, name: 'Coca Cola 500ml', category: 'Beverages', sku: 'COLA-002', stock: 18, unit: 'Bottle', buyPrice: 90, sellPrice: 150, location: 'Shelf 2' },
  { id: 3, name: 'Fresh Chicken', category: 'Meat', sku: 'CHK-011', stock: 9, unit: 'Kg', buyPrice: 420, sellPrice: 610, location: 'Cold Room' },
  { id: 4, name: 'Office Chair', category: 'Furniture', sku: 'OFF-104', stock: 7, unit: 'Unit', buyPrice: 8500, sellPrice: 12000, location: 'Store Room' },
];

const initialSales = [
  { id: 1, customer: 'Tariq Store', item: 'Coca Cola 500ml', qty: 12, amount: 1800, date: '2026-10-01', status: 'Paid' },
  { id: 2, customer: 'Blue Mart', item: 'Rice 25kg', qty: 5, amount: 9500, date: '2026-10-02', status: 'Paid' },
  { id: 3, customer: 'City Cafe', item: 'Fresh Chicken', qty: 4, amount: 2440, date: '2026-10-03', status: 'Unpaid' },
];

const initialPurchases = [
  { id: 1, supplier: 'Northern Foods', item: 'Rice 25kg', qty: 30, amount: 42000, date: '2026-09-28', status: 'Received' },
  { id: 2, supplier: 'Metro Drinks', item: 'Coca Cola 500ml', qty: 40, amount: 3600, date: '2026-09-30', status: 'Received' },
];

const initialCustomers = [
  { id: 1, name: 'Tariq Store', phone: '+966500111222', balance: 0 },
  { id: 2, name: 'Blue Mart', phone: '+966500333444', balance: 1500 },
  { id: 3, name: 'City Cafe', phone: '+966500555666', balance: 2440 },
];

const initialSuppliers = [
  { id: 1, name: 'Northern Foods', phone: '+966500222333', balance: 0 },
  { id: 2, name: 'Metro Drinks', phone: '+966500444555', balance: 0 },
  { id: 3, name: 'Modern Furniture', phone: '+966500777888', balance: 8000 },
];

const initialPlans = [
  { name: 'Starter', price: 29, feature: 'For small shops' },
  { name: 'Growth', price: 79, feature: 'For growing businesses' },
  { name: 'Scale', price: 149, feature: 'For multiple branches' },
];

const initialLicenses = [
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
];

const tabs = ['Dashboard', 'Products', 'Sales', 'Purchases', 'Customers', 'Suppliers', 'Reports', 'Billing', 'Licensing', 'Settings'];

export default function Home() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ email: 'admin@bizstock.app', password: 'admin123' });
  const [company, setCompany] = useState({
    name: 'Northwind Mart',
    owner: 'Humayun Khan',
    type: 'Retail & Grocery',
    location: 'Dubai',
    currency: 'USD',
    plan: 'Growth',
  });

  const [activeTab, setActiveTab] = useState('Dashboard');
  const [products, setProducts] = useState(initialProducts);
  const [sales, setSales] = useState(initialSales);
  const [purchases, setPurchases] = useState(initialPurchases);
  const [customers, setCustomers] = useState(initialCustomers);
  const [suppliers, setSuppliers] = useState(initialSuppliers);
  const [plans] = useState(initialPlans);
  const [licenses, setLicenses] = useState(initialLicenses);
  const [newLicenseForm, setNewLicenseForm] = useState({ phoneNumber: '', businessName: '', email: '' });

  const [productForm, setProductForm] = useState({
    name: '',
    category: '',
    sku: '',
    stock: '',
    unit: '',
    buyPrice: '',
    sellPrice: '',
    location: '',
  });

  const [saleForm, setSaleForm] = useState({ customer: '', item: '', qty: '', amount: '', date: new Date().toISOString().slice(0, 10) });
  const [purchaseForm, setPurchaseForm] = useState({ supplier: '', item: '', qty: '', amount: '', date: new Date().toISOString().slice(0, 10) });

  useEffect(() => {
    const saved = localStorage.getItem('bizstock-app-data');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.products) setProducts(data.products);
        if (data.sales) setSales(data.sales);
        if (data.purchases) setPurchases(data.purchases);
        if (data.customers) setCustomers(data.customers);
        if (data.suppliers) setSuppliers(data.suppliers);
        if (data.company) setCompany(data.company);
        if (data.licenses) setLicenses(data.licenses);
      } catch (error) {
        console.error('Failed parsing local data', error);
      }
    }
  }, []);

  useEffect(() => {
    const payload = { products, sales, purchases, customers, suppliers, company, licenses };
    localStorage.setItem('bizstock-app-data', JSON.stringify(payload));
  }, [products, sales, purchases, customers, suppliers, company, licenses]);

  const totalInventoryValue = useMemo(
    () => products.reduce((sum, item) => sum + item.stock * item.buyPrice, 0),
    [products]
  );

  const lowStockItems = products.filter((item) => item.stock <= 10);

  const totalSales = sales.reduce((sum, item) => sum + item.amount, 0);
  const totalPurchases = purchases.reduce((sum, item) => sum + item.amount, 0);
  const totalProfit = totalSales - totalPurchases;
  const totalRevenue = licenses.filter((license) => license.status === 'active').length * 9;
  const activeLicenses = licenses.filter((license) => license.status === 'active').length;

  const handleAuthSubmit = (event) => {
    event.preventDefault();
    if (!authForm.email || !authForm.password) return;
    setLoggedIn(true);
  };

  const handleCreateLicense = (event) => {
    event.preventDefault();

    if (!newLicenseForm.phoneNumber || !newLicenseForm.businessName || !newLicenseForm.email) {
      alert('Please fill all required fields');
      return;
    }

    const license = createLicense({
      ...newLicenseForm,
      paymentId: `pay_${Date.now()}`,
    });

    setLicenses((current) => [license, ...current]);
    setNewLicenseForm({ phoneNumber: '', businessName: '', email: '' });
    setActiveTab('Licensing');
    alert(`License created: ${license.licenseKey}`);
  };

  const revokeLicense = (licenseKey) => {
    setLicenses((current) =>
      current.map((license) =>
        license.licenseKey === licenseKey ? { ...license, status: 'revoked' } : license
      )
    );
  };

  const renewLicense = (licenseKey) => {
    setLicenses((current) =>
      current.map((license) => {
        if (license.licenseKey === licenseKey) {
          return {
            ...license,
            createdDate: new Date().toISOString(),
            expiryDate: getLicenseExpiryDate().toISOString(),
            status: 'active',
          };
        }
        return license;
      })
    );
  };

  const addProduct = (event) => {
    event.preventDefault();
    if (!productForm.name || !productForm.category || !productForm.sku) return;

    const newProduct = {
      id: Date.now(),
      name: productForm.name,
      category: productForm.category,
      sku: productForm.sku,
      stock: Number(productForm.stock) || 0,
      unit: productForm.unit || 'Unit',
      buyPrice: Number(productForm.buyPrice) || 0,
      sellPrice: Number(productForm.sellPrice) || 0,
      location: productForm.location || 'Main Store',
    };

    setProducts((current) => [newProduct, ...current]);
    setProductForm({
      name: '',
      category: '',
      sku: '',
      stock: '',
      unit: '',
      buyPrice: '',
      sellPrice: '',
      location: '',
    });
  };

  const addSale = (event) => {
    event.preventDefault();
    if (!saleForm.customer || !saleForm.item || !saleForm.qty) return;

    const qty = Number(saleForm.qty);
    const amount = Number(saleForm.amount) || 0;

    setSales((current) => [
      {
        id: Date.now(),
        customer: saleForm.customer,
        item: saleForm.item,
        qty,
        amount,
        date: saleForm.date,
        status: 'Paid',
      },
      ...current,
    ]);

    setProducts((current) =>
      current.map((product) =>
        product.name.toLowerCase() === saleForm.item.toLowerCase()
          ? { ...product, stock: Math.max(0, product.stock - qty) }
          : product
      )
    );

    setSaleForm({ customer: '', item: '', qty: '', amount: '', date: new Date().toISOString().slice(0, 10) });
  };

  const addPurchase = (event) => {
    event.preventDefault();
    if (!purchaseForm.supplier || !purchaseForm.item || !purchaseForm.qty) return;

    const qty = Number(purchaseForm.qty);
    const amount = Number(purchaseForm.amount) || 0;

    setPurchases((current) => [
      {
        id: Date.now(),
        supplier: purchaseForm.supplier,
        item: purchaseForm.item,
        qty,
        amount,
        date: purchaseForm.date,
        status: 'Received',
      },
      ...current,
    ]);

    setProducts((current) =>
      current.map((product) =>
        product.name.toLowerCase() === purchaseForm.item.toLowerCase()
          ? { ...product, stock: product.stock + qty }
          : product
      )
    );

    setPurchaseForm({ supplier: '', item: '', qty: '', amount: '', date: new Date().toISOString().slice(0, 10) });
  };

  const renderDashboard = () => (
    <div className="panel-grid">
      <div className="stat-card accent purple">
        <span>Total Products</span>
        <strong>{products.length}</strong>
        <small>Active inventory items</small>
      </div>
      <div className="stat-card accent blue">
        <span>Inventory Value</span>
        <strong>${totalInventoryValue.toLocaleString()}</strong>
        <small>Cost basis</small>
      </div>
      <div className="stat-card accent green">
        <span>Total Sales</span>
        <strong>${totalSales.toLocaleString()}</strong>
        <small>Revenue generated</small>
      </div>
      <div className="stat-card accent orange">
        <span>Low Stock</span>
        <strong>{lowStockItems.length}</strong>
        <small>Needs attention</small>
      </div>

      <div className="card wide">
        <div className="card-header">
          <h3>Inventory Summary</h3>
        </div>
        <div className="bars">
          {products.slice(0, 6).map((item) => (
            <div key={item.id} className="bar-row">
              <div className="bar-label">
                <span>{item.name}</span>
                <small>{item.stock} units</small>
              </div>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${Math.min(item.stock * 4, 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card wide">
        <div className="card-header">
          <h3>Quick Insights</h3>
        </div>
        <ul className="insights">
          <li>Net profit: ${totalProfit.toLocaleString()}</li>
          <li>Average product stock: {Math.round(products.reduce((sum, item) => sum + item.stock, 0) / Math.max(products.length, 1))}</li>
          <li>Top category: {products[0]?.category || 'General'}</li>
          <li>Subscription: {company.plan || 'Growth'} plan active</li>
        </ul>
      </div>
    </div>
  );

  const renderProducts = () => (
    <div className="content-split">
      <form className="card form-card" onSubmit={addProduct}>
        <div className="card-header">
          <h3>Add Product</h3>
        </div>
        <div className="form-grid">
          <input value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} placeholder="Product name" />
          <input value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })} placeholder="Category" />
          <input value={productForm.sku} onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })} placeholder="SKU" />
          <input value={productForm.stock} type="number" onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })} placeholder="Stock" />
          <input value={productForm.unit} onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })} placeholder="Unit" />
          <input value={productForm.buyPrice} type="number" onChange={(e) => setProductForm({ ...productForm, buyPrice: e.target.value })} placeholder="Buy price" />
          <input value={productForm.sellPrice} type="number" onChange={(e) => setProductForm({ ...productForm, sellPrice: e.target.value })} placeholder="Sell price" />
          <input value={productForm.location} onChange={(e) => setProductForm({ ...productForm, location: e.target.value })} placeholder="Storage location" />
        </div>
        <button className="primary-btn" type="submit">Save Product</button>
      </form>

      <div className="card table-card">
        <div className="card-header">
          <h3>Product List</h3>
        </div>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>SKU</th>
              <th>Stock</th>
              <th>Price</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody>
            {products.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.sku}</td>
                <td>{item.stock}</td>
                <td>${item.sellPrice}</td>
                <td>{item.location}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSales = () => (
    <div className="content-split">
      <form className="card form-card" onSubmit={addSale}>
        <div className="card-header">
          <h3>New Sale</h3>
        </div>
        <div className="form-grid">
          <input value={saleForm.customer} onChange={(e) => setSaleForm({ ...saleForm, customer: e.target.value })} placeholder="Customer" />
          <input value={saleForm.item} onChange={(e) => setSaleForm({ ...saleForm, item: e.target.value })} placeholder="Item name" />
          <input value={saleForm.qty} type="number" onChange={(e) => setSaleForm({ ...saleForm, qty: e.target.value })} placeholder="Qty" />
          <input value={saleForm.amount} type="number" onChange={(e) => setSaleForm({ ...saleForm, amount: e.target.value })} placeholder="Amount" />
          <input value={saleForm.date} type="date" onChange={(e) => setSaleForm({ ...saleForm, date: e.target.value })} />
        </div>
        <button className="primary-btn" type="submit">Record Sale</button>
      </form>

      <div className="card table-card">
        <div className="card-header">
          <h3>Sales History</h3>
        </div>
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Item</th>
              <th>Qty</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => (
              <tr key={sale.id}>
                <td>{sale.customer}</td>
                <td>{sale.item}</td>
                <td>{sale.qty}</td>
                <td>${sale.amount}</td>
                <td>{sale.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPurchases = () => (
    <div className="content-split">
      <form className="card form-card" onSubmit={addPurchase}>
        <div className="card-header">
          <h3>New Purchase</h3>
        </div>
        <div className="form-grid">
          <input value={purchaseForm.supplier} onChange={(e) => setPurchaseForm({ ...purchaseForm, supplier: e.target.value })} placeholder="Supplier" />
          <input value={purchaseForm.item} onChange={(e) => setPurchaseForm({ ...purchaseForm, item: e.target.value })} placeholder="Item name" />
          <input value={purchaseForm.qty} type="number" onChange={(e) => setPurchaseForm({ ...purchaseForm, qty: e.target.value })} placeholder="Qty" />
          <input value={purchaseForm.amount} type="number" onChange={(e) => setPurchaseForm({ ...purchaseForm, amount: e.target.value })} placeholder="Amount" />
          <input value={purchaseForm.date} type="date" onChange={(e) => setPurchaseForm({ ...purchaseForm, date: e.target.value })} />
        </div>
        <button className="primary-btn" type="submit">Record Purchase</button>
      </form>

      <div className="card table-card">
        <div className="card-header">
          <h3>Purchase History</h3>
        </div>
        <table>
          <thead>
            <tr>
              <th>Supplier</th>
              <th>Item</th>
              <th>Qty</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {purchases.map((purchase) => (
              <tr key={purchase.id}>
                <td>{purchase.supplier}</td>
                <td>{purchase.item}</td>
                <td>{purchase.qty}</td>
                <td>${purchase.amount}</td>
                <td>{purchase.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCustomers = () => (
    <div className="card table-card full-width">
      <div className="card-header">
        <h3>Customers</h3>
      </div>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Balance</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.id}>
              <td>{customer.name}</td>
              <td>{customer.phone}</td>
              <td>${customer.balance}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderSuppliers = () => (
    <div className="card table-card full-width">
      <div className="card-header">
        <h3>Suppliers</h3>
      </div>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Balance</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map((supplier) => (
            <tr key={supplier.id}>
              <td>{supplier.name}</td>
              <td>{supplier.phone}</td>
              <td>${supplier.balance}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderReports = () => (
    <div className="panel-grid">
      <div className="card wide">
        <div className="card-header">
          <h3>Sales vs Purchases</h3>
        </div>
        <div className="mini-chart">
          <div className="chart-col sales" style={{ height: `${Math.min((totalSales / 100000) * 100, 100)}%` }} />
          <div className="chart-col purchase" style={{ height: `${Math.min((totalPurchases / 100000) * 100, 100)}%` }} />
        </div>
        <div className="legend">
          <span><i className="dot sales-dot" /> Sales</span>
          <span><i className="dot purchase-dot" /> Purchases</span>
        </div>
      </div>

      <div className="card wide">
        <div className="card-header">
          <h3>Best Performing Products</h3>
        </div>
        <ul className="list-stack">
          {products.slice(0, 4).map((item) => (
            <li key={item.id}><strong>{item.name}</strong> <span>{item.stock} units</span></li>
          ))}
        </ul>
      </div>
    </div>
  );

  const renderBilling = () => (
    <div className="pricing-grid">
      {plans.map((plan) => (
        <div className="pricing-card" key={plan.name}>
          <span className="plan-tag">{plan.name}</span>
          <h3>${plan.price}<small>/month</small></h3>
          <p>{plan.feature}</p>
          <ul>
            <li>Unlimited invoices</li>
            <li>Inventory tracking</li>
            <li>Sales and purchase reports</li>
            <li>Priority support</li>
          </ul>
          <button className="primary-btn">Choose Plan</button>
        </div>
      ))}
    </div>
  );

  const renderLicensing = () => (
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
          <strong>{activeLicenses}</strong>
        </div>
        <div className="stat-box">
          <span>Annual Revenue</span>
          <strong>${totalRevenue}</strong>
        </div>
        <div className="stat-box">
          <span>Revoked Licenses</span>
          <strong>{licenses.filter((license) => license.status === 'revoked').length}</strong>
        </div>
        <div className="stat-box">
          <span>Total Users</span>
          <strong>{licenses.length}</strong>
        </div>
      </div>

      <div className="licensing-content">
        <div className="form-section card">
          <h3>Create New License</h3>
          <p className="description">When payment is received, generate a new license automatically.</p>

          <form onSubmit={handleCreateLicense}>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                placeholder="+966 50 XXXX XXXX"
                value={newLicenseForm.phoneNumber}
                onChange={(e) => setNewLicenseForm({ ...newLicenseForm, phoneNumber: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Business Name</label>
              <input
                type="text"
                placeholder="Your shop or business name"
                value={newLicenseForm.businessName}
                onChange={(e) => setNewLicenseForm({ ...newLicenseForm, businessName: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="user@example.com"
                value={newLicenseForm.email}
                onChange={(e) => setNewLicenseForm({ ...newLicenseForm, email: e.target.value })}
              />
            </div>

            <div className="payment-box">
              <div className="payment-item">
                <span>Annual Plan</span>
                <strong>$9.00</strong>
              </div>
              <div className="payment-item">
                <span>Payment Method</span>
                <span className="badge">STRIPE</span>
              </div>
            </div>

            <button type="submit" className="primary-btn full-width">Generate License & Process Payment</button>
          </form>
        </div>

        <div className="licenses-section card">
          <h3>Active Licenses</h3>
          <p className="description">All licenses, their status, and expiry dates</p>

          <div className="licenses-table">
            <table>
              <thead>
                <tr>
                  <th>License Key</th>
                  <th>Business</th>
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
                      <td className="license-key"><code>{license.licenseKey}</code></td>
                      <td>{license.businessName}</td>
                      <td>{license.phoneNumber}</td>
                      <td>{new Date(license.createdDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                      <td>{new Date(license.expiryDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
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

  const renderSettings = () => (
    <div className="settings-grid">
      <div className="card">
        <div className="card-header">
          <h3>Business Details</h3>
        </div>
        <div className="form-grid settings-form">
          <input value={company.name} onChange={(e) => setCompany({ ...company, name: e.target.value })} placeholder="Business name" />
          <input value={company.owner} onChange={(e) => setCompany({ ...company, owner: e.target.value })} placeholder="Owner name" />
          <input value={company.type} onChange={(e) => setCompany({ ...company, type: e.target.value })} placeholder="Business type" />
          <input value={company.location} onChange={(e) => setCompany({ ...company, location: e.target.value })} placeholder="Business location" />
          <input value={company.currency} onChange={(e) => setCompany({ ...company, currency: e.target.value })} placeholder="Currency" />
          <select value={company.plan} onChange={(e) => setCompany({ ...company, plan: e.target.value })}>
            <option>Starter</option>
            <option>Growth</option>
            <option>Scale</option>
          </select>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Account Status</h3>
        </div>
        <div className="account-box">
          <div className="status-pill">{company.plan} Plan</div>
          <h4>{company.name}</h4>
          <p>{authForm.email}</p>
          <ul>
            <li>Multi-device access</li>
            <li>Inventory dashboard</li>
            <li>Sales & purchase tracking</li>
            <li>Report exports</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const switchRender = () => {
    if (activeTab === 'Dashboard') return renderDashboard();
    if (activeTab === 'Products') return renderProducts();
    if (activeTab === 'Sales') return renderSales();
    if (activeTab === 'Purchases') return renderPurchases();
    if (activeTab === 'Customers') return renderCustomers();
    if (activeTab === 'Suppliers') return renderSuppliers();
    if (activeTab === 'Reports') return renderReports();
    if (activeTab === 'Billing') return renderBilling();
    if (activeTab === 'Licensing') return renderLicensing();
    if (activeTab === 'Settings') return renderSettings();
    return renderDashboard();
  };

  if (!loggedIn) {
    return (
      <div className="auth-shell">
        <div className="auth-card">
          <div className="auth-badge">BizStock</div>
          <h1>{authMode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
          <p>Professional inventory management for retail shops, restaurants, malls, and warehouses.</p>

          <form onSubmit={handleAuthSubmit} className="auth-form">
            <input
              value={authForm.email}
              onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
              placeholder="Email address"
              type="email"
            />
            <input
              value={authForm.password}
              onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
              placeholder="Password"
              type="password"
            />

            <button className="primary-btn full-width" type="submit">
              {authMode === 'login' ? 'Login to Dashboard' : 'Create Account'}
            </button>
          </form>

          <button className="ghost-btn full-width auth-toggle" onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}>
            {authMode === 'login' ? 'Need an account? Sign up' : 'Already have an account? Login'}
          </button>

          <div className="demo-box">
            Demo access: admin@bizstock.app / admin123
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand-box">
          <div className="brand-mark">B</div>
          <div>
            <strong>{company.name}</strong>
            <span>{company.type}</span>
          </div>
        </div>

        <nav className="nav-list">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={tab === activeTab ? 'nav-btn active' : 'nav-btn'}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </nav>
      </aside>

      <section className="main-panel">
        <header className="topbar">
          <div>
            <p className="eyebrow">Business overview</p>
            <h1>Inventory Management Dashboard</h1>
          </div>
          <div className="top-actions">
            <button className="ghost-btn" onClick={() => setLoggedIn(false)}>Logout</button>
            <button className="primary-btn">Add Invoice</button>
          </div>
        </header>

        {switchRender()}
      </section>
    </main>
  );
}
