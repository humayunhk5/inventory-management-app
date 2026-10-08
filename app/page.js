'use client';

import { useEffect, useMemo, useState } from 'react';

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

const tabs = ['Dashboard', 'Products', 'Sales', 'Purchases', 'Customers', 'Suppliers', 'Reports', 'Billing'];

export default function Home() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [products, setProducts] = useState(initialProducts);
  const [sales, setSales] = useState(initialSales);
  const [purchases, setPurchases] = useState(initialPurchases);
  const [customers, setCustomers] = useState(initialCustomers);
  const [suppliers, setSuppliers] = useState(initialSuppliers);
  const [plans] = useState(initialPlans);

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
      } catch (error) {
        console.error('Failed parsing local data', error);
      }
    }
  }, []);

  useEffect(() => {
    const payload = { products, sales, purchases, customers, suppliers };
    localStorage.setItem('bizstock-app-data', JSON.stringify(payload));
  }, [products, sales, purchases, customers, suppliers]);

  const totalInventoryValue = useMemo(
    () => products.reduce((sum, item) => sum + item.stock * item.buyPrice, 0),
    [products]
  );

  const lowStockItems = products.filter((item) => item.stock <= 10);

  const totalSales = sales.reduce((sum, item) => sum + item.amount, 0);
  const totalPurchases = purchases.reduce((sum, item) => sum + item.amount, 0);
  const totalProfit = totalSales - totalPurchases;

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
          <li>Subscription status: Active</li>
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

  const switchRender = () => {
    if (activeTab === 'Dashboard') return renderDashboard();
    if (activeTab === 'Products') return renderProducts();
    if (activeTab === 'Sales') return renderSales();
    if (activeTab === 'Purchases') return renderPurchases();
    if (activeTab === 'Customers') return renderCustomers();
    if (activeTab === 'Suppliers') return renderSuppliers();
    if (activeTab === 'Reports') return renderReports();
    if (activeTab === 'Billing') return renderBilling();
    return renderDashboard();
  };

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand-box">
          <div className="brand-mark">B</div>
          <div>
            <strong>BizStock</strong>
            <span>Inventory SaaS</span>
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
            <button className="ghost-btn">Export</button>
            <button className="primary-btn">Add Invoice</button>
          </div>
        </header>

        {switchRender()}
      </section>
    </main>
  );
}
