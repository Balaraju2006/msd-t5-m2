const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

const FILE_PATH = path.join(__dirname, 'products.json');

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());

// Utility function to read products
function readProducts() {
  try {
    if (!fs.existsSync(FILE_PATH)) {
      fs.writeFileSync(FILE_PATH, '[]');
    }
    const data = fs.readFileSync(FILE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading products:', err);
    return [];
  }
}

// Utility function to write products
function writeProducts(products) {
  try {
    fs.writeFileSync(FILE_PATH, JSON.stringify(products, null, 2));
  } catch (err) {
    console.error('Error writing products:', err);
  }
}

// GET /products → return all products
app.get('/products', (req, res) => {
  const products = readProducts();
  res.json(products);
});

// POST /products → add a product
app.post('/products', (req, res) => {
  const { name, price, inStock } = req.body;
  if (typeof name !== 'string' || typeof price !== 'number' || typeof inStock !== 'boolean') {
    return res.status(400).json({ error: 'Invalid input format' });
  }

  const products = readProducts();
  const newId = products.length ? Math.max(...products.map(p => p.id)) + 1 : 1;
  const newProduct = { id: newId, name, price, inStock };
  products.push(newProduct);
  writeProducts(products);

  res.status(201).json(newProduct);
});

// PUT /products/:id → update a product
app.put('/products/:id', (req, res) => {
  const productId = parseInt(req.params.id);
  const { name, price, inStock } = req.body;

  const products = readProducts();
  const index = products.findIndex(p => p.id === productId);

  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const product = products[index];
  if (name !== undefined) {
    if (typeof name !== 'string') return res.status(400).json({ error: 'Invalid name' });
    product.name = name;
  }
  if (price !== undefined) {
    if (typeof price !== 'number') return res.status(400).json({ error: 'Invalid price' });
    product.price = price;
  }
  if (inStock !== undefined) {
    if (typeof inStock !== 'boolean') return res.status(400).json({ error: 'Invalid inStock value' });
    product.inStock = inStock;
  }

  products[index] = product;
  writeProducts(products);
  res.json(product);
});

// DELETE /products/:id → remove a product
app.delete('/products/:id', (req, res) => {
  const productId = parseInt(req.params.id);
  let products = readProducts();
  const index = products.findIndex(p => p.id === productId);

  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  products.splice(index, 1);
  writeProducts(products);
  res.json({ message: `Product with id ${productId} deleted successfully` });
});

// BONUS: GET /products/instock → only in-stock products
app.get('/products/instock', (req, res) => {
  const products = readProducts();
  const inStockProducts = products.filter(p => p.inStock);
  res.json(inStockProducts);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
