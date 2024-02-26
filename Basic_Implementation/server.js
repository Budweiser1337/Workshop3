const express = require('express');
const bodyParser = require('body-parser');
const jsonServer = require('json-server');

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.use('/products', jsonServer.router('db.json').router);
app.use('/orders', jsonServer.router('db.json').router);
app.use('/cart', jsonServer.router('db.json').router);

const db = require('./db.json');

// Products Routes

app.get('/products', (req, res) => {
  let filteredProducts = db.products;
  if (req.query.category) {
    filteredProducts = filteredProducts.filter(product => product.category === req.query.category);
  }
  if (req.query.inStock) {
    const inStock = req.query.inStock.toLowerCase() === 'true';
    filteredProducts = filteredProducts.filter(product => product.inStock === inStock);
  }

  res.json(filteredProducts);
});

app.get('/products/:id', (req, res) => {
  const productId = parseInt(req.params.id);
  const product = db.products.find(product => product.id === productId);

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  res.json(product);
});

app.post('/products', (req, res) => {
  const newProduct = req.body;
  newProduct.id = db.products.length + 1;

  db.products.push(newProduct);

  res.json(newProduct);
});

app.put('/products/:id', (req, res) => {
  const productId = parseInt(req.params.id);
  const updatedProduct = req.body;

  const index = db.products.findIndex(product => product.id === productId);

  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  db.products[index] = { ...db.products[index], ...updatedProduct };

  res.json(db.products[index]);
});

app.delete('/products/:id', (req, res) => {
  const productId = parseInt(req.params.id);

  db.products = db.products.filter(product => product.id !== productId);

  res.json({ message: 'Product deleted successfully' });
});

// Orders Routes

app.post('/orders', (req, res) => {
  const newOrder = req.body;
  newOrder.id = db.orders.length + 1;

  newOrder.totalPrice = newOrder.products.reduce(
    (total, { productId, quantity }) => {
      const product = db.products.find(product => product.id === productId);
      return total + product.price * quantity;
    },
    0
  );

  newOrder.status = 'Pending'; // Set default status

  db.orders.push(newOrder);

  res.json(newOrder);
});

app.get('/orders/:userId', (req, res) => {
  const userId = parseInt(req.params.userId);
  const userOrders = db.orders.filter(order => order.userId === userId);

  res.json(userOrders);
});

// Cart Routes

app.post('/cart/:userId', (req, res) => {
  const userId = parseInt(req.params.userId);
  const { productId, quantity } = req.body;

  const product = db.products.find(product => product.id === productId);

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  let userCart = db.carts[userId];

  if (!userCart) {
    userCart = { items: [], totalPrice: 0 };
    db.carts[userId] = userCart;
  }

  const existingCartItem = userCart.items.find(item => item.productId === productId);

  if (existingCartItem) {
    existingCartItem.quantity += quantity;
  } else {
    userCart.items.push({ productId, quantity });
  }

  userCart.totalPrice += product.price * quantity;

  res.json(userCart);
});

app.get('/cart/:userId', (req, res) => {
  const userId = parseInt(req.params.userId);
  const userCart = db.carts[userId];

  if (!userCart) {
    return res.status(404).json({ error: 'Cart not found' });
  }

  res.json(userCart);
});

app.delete('/cart/:userId/item/:productId', (req, res) => {
  const userId = parseInt(req.params.userId);
  const productId = parseInt(req.params.productId);

  let userCart = db.carts[userId];

  if (!userCart) {
    return res.status(404).json({ error: 'Cart not found' });
  }

  userCart.items = userCart.items.filter(item => item.productId !== productId);

  userCart.totalPrice = userCart.items.reduce(
    (total, { productId, quantity }) => {
      const product = db.products.find(product => product.id === productId);
      return total + product.price * quantity;
    },
    0
  );

  res.json(userCart);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
