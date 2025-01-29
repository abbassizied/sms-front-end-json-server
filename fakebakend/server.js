
const Supplier = require('./Supplier');
const Product = require('./Product');

//--------------------------------------------------------------
//--------------------------------------------------------------
//--------------------------------------------------------------

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 8080;
 
// Initialize database (load from db.json if it exists)
const dbPath = path.join(__dirname, 'db.json');
let db = { suppliers: [], products: [] };

if (fs.existsSync(dbPath)) {
  const data = fs.readFileSync(dbPath, 'utf-8');
  db = JSON.parse(data);
}

// Create uploads directory if missing
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({ storage });

// Enable CORS
app.use(cors());
// Middleware
app.use(express.json());
console.log("Serving static files from:", uploadDir);
app.use('/uploads', express.static(uploadDir));

// ------------------------------------------
// SUPPLIERS ENDPOINTS
// ------------------------------------------

// Create Supplier (with logo image)
app.post('/suppliers', upload.single('logoUrl'), (req, res) => {
  
  /*	
  console.log('Debug:', req.body); // Check request body
  console.log('Debug File:', req.file); // Check file if using Multer
  console.log('Debug Params:', req.params); // Check URL parameters
  */
	
  console.log("rcv request: " + req.body.supplier);
	 
  const { name, email, phone, address } = req.body; // Get all fields from form data
  const logoUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

  const newSupplier = new Supplier(name, email, phone, address, logoUrl);
  newSupplier.id = db.suppliers.length ? db.suppliers[db.suppliers.length - 1].id + 1 : 1;  

  db.suppliers.push(newSupplier);
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  res.status(201).json(newSupplier);
});

// Get All Suppliers
app.get('/suppliers', (req, res) => {
  res.json(db.suppliers);
});

// Update Supplier (with logo image)
app.put('/suppliers/:id', upload.single('logoUrl'), (req, res) => {
  const { id } = req.params;
  const { name, email, phone, address } = req.body;
  const supplier = db.suppliers.find(s => s.id === parseInt(id));

  if (!supplier) return res.status(404).json({ error: 'Supplier not found' });

  // Update all fields
  supplier.name = name || supplier.name;
  supplier.email = email || supplier.email;
  supplier.phone = phone || supplier.phone;
  supplier.address = address || supplier.address;
  
  if (req.file) {
    supplier.logoUrl = `/uploads/${req.file.filename}`;
  }

  supplier.lastUpdated = new Date().toISOString();

  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  res.json(supplier);
});


// DELETE Supplier
app.delete('/suppliers/:id', (req, res) => {
  const { id } = req.params;
  const supplierIndex = db.suppliers.findIndex(s => s.id === parseInt(id));

  if (supplierIndex === -1) {
    return res.status(404).json({ error: 'Supplier not found' });
  }

  // Delete associated logo file
  const supplier = db.suppliers[supplierIndex];
  if (supplier.logoUrl) {
    const logoPath = path.join(__dirname, supplier.logoUrl);
    if (fs.existsSync(logoPath)) {
      fs.unlinkSync(logoPath);
    }
  }

  db.suppliers.splice(supplierIndex, 1);
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  res.status(204).send();
});
// ------------------------------------------
// PRODUCTS ENDPOINTS
// ------------------------------------------

// Create Product (with mainImage + images)
app.post('/products', upload.fields([
  { name: 'mainImage', maxCount: 1 },
  { name: 'images', maxCount: 10 }
]), (req, res) => {
  const { name, supplierId } = req.body;
  const mainImageUrl = req.files['mainImage'] ? `/uploads/${req.files['mainImage'][0].filename}` : null;
  const imagesUrls = req.files['images'] ? req.files['images'].map(f => `/uploads/${f.filename}`) : [];

  const newProduct = {
    id: db.products.length + 1,
    name,
    supplierId: parseInt(supplierId),
    mainImageUrl,
    imagesUrls
  };
/*
  const newProduct = new Product(name, parseInt(supplierId), mainImageUrl, imagesUrls);
  newProduct.id = db.products.length ? db.products[db.products.length - 1].id + 1 : 1;
*/
  db.products.push(newProduct);
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  res.status(201).json(newProduct);
});

// Get All Products
app.get('/products', (req, res) => {
  res.json(db.products);
});

// Get Single Supplier by ID
app.get('/suppliers/:id', (req, res) => {
  const { id } = req.params;
  
  // Validate ID format
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid supplier ID format' });
  }

  const supplier = db.suppliers.find(s => s.id === parseInt(id));
  
  if (!supplier) {
    return res.status(404).json({ error: 'Supplier not found' });
  }

  res.json(supplier);
});

// Update Product (with mainImage + images)
app.put('/products/:id', upload.fields([
  { name: 'mainImage', maxCount: 1 },
  { name: 'images', maxCount: 10 }
]), (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const product = db.products.find(p => p.id === parseInt(id));

  if (!product) return res.status(404).json({ error: 'Product not found' });

  product.name = name || product.name;
  if (req.files['mainImage']) {
    product.mainImageUrl = `/uploads/${req.files['mainImage'][0].filename}`;
  }
  if (req.files['images']) {
    product.imagesUrls = req.files['images'].map(f => `/uploads/${f.filename}`);
  }

  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  res.json(product);
});

// DELETE Product
app.delete('/products/:id', (req, res) => {
  const { id } = req.params;
  const productIndex = db.products.findIndex(p => p.id === parseInt(id));

  if (productIndex === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  // Delete associated images
  const product = db.products[productIndex];
  if (product.mainImageUrl) {
    const mainImagePath = path.join(__dirname, product.mainImageUrl);
    if (fs.existsSync(mainImagePath)) {
      fs.unlinkSync(mainImagePath);
    }
  }

  product.imagesUrls?.forEach(imageUrl => {
    const imagePath = path.join(__dirname, imageUrl);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  });

  db.products.splice(productIndex, 1);
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  res.status(204).send();
});
// ------------------------------------------
// START SERVER
// ------------------------------------------
app.listen(PORT, () => {
  console.log(`REST API running on http://localhost:${PORT}`);
});