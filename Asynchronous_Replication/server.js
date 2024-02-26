const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs/promises');

const app = express();
const port = 3000;

const primaryDBPath = 'primaryDB.json';
const secondaryDBPath = 'secondaryDB.json';

app.use(bodyParser.json());

async function readDatabase(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

async function writeDatabase(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

async function replicateData() {
  try {
    const primaryDB = await readDatabase(primaryDBPath);
    await writeDatabase(secondaryDBPath, primaryDB);
    console.log('Data replicated successfully');
  } catch (error) {
    console.error('Error replicating data:', error);
  }
}

// Simulate asynchronous replication every 5 seconds
setInterval(replicateData, 5000);

// Products Routes

app.get('/products', async (req, res) => {
  try {
    const primaryDB = await readDatabase(primaryDBPath);
    res.json(primaryDB);
  } catch (error) {
    console.error('Error reading products from the primary database:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/products/:id', async (req, res) => {
  const productId = parseInt(req.params.id);

  try {
    const primaryDB = await readDatabase(primaryDBPath);
    const product = primaryDB.find((product) => product.id === productId);

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.json(product);
  } catch (error) {
    console.error('Error reading product details from the primary database:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/products', async (req, res) => {
  const newProduct = req.body;

  try {
    let primaryDB = await readDatabase(primaryDBPath);
    newProduct.id = primaryDB.length + 1;
    primaryDB.push(newProduct);
    await writeDatabase(primaryDBPath, primaryDB);

    res.json(newProduct);
  } catch (error) {
    console.error('Error writing to the primary database:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put('/products/:id', async (req, res) => {
  const productId = parseInt(req.params.id);
  const updatedProduct = req.body;

  try {
    let primaryDB = await readDatabase(primaryDBPath);
    const index = primaryDB.findIndex((product) => product.id === productId);

    if (index === -1) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    primaryDB[index] = { ...primaryDB[index], ...updatedProduct };
    await writeDatabase(primaryDBPath, primaryDB);

    res.json(primaryDB[index]);
  } catch (error) {
    console.error('Error updating product in the primary database:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.delete('/products/:id', async (req, res) => {
  const productId = parseInt(req.params.id);

  try {
    let primaryDB = await readDatabase(primaryDBPath);
    primaryDB = primaryDB.filter((product) => product.id !== productId);
    await writeDatabase(primaryDBPath, primaryDB);

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product from the primary database:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Orders Routes

app.post('/orders', async (req, res) => {
  const newOrder = req.body;
  newOrder.id = Date.now(); // Use a timestamp as a simple unique ID

  try {
    let primaryDB = await readDatabase(primaryDBPath);
    primaryDB.push(newOrder);
    await writeDatabase(primaryDBPath, primaryDB);

    res.json(newOrder);
  } catch (error) {
    console.error('Error writing order to the primary database:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/orders/:userId', async (req, res) => {
  const userId = parseInt(req.params.userId);

  try {
    const primaryDB = await readDatabase(primaryDBPath);
    const userOrders = primaryDB.filter((order) => order.userId === userId);

    res.json(userOrders);
  } catch (error) {
    console.error('Error reading user orders from the primary database:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Cart Routes

app.post('/cart/:userId', async (req, res) => {
  const userId = parseInt(req.params.userId);
  const { productId, quantity } = req.body;

  try {
    let primaryDB = await readDatabase(primaryDBPath);
    const product = primaryDB.find((product) => product.id === productId);

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    let userCart = primaryDB.carts[userId];

    if (!userCart) {
      userCart = { items: [], totalPrice: 0 };
      primaryDB.carts[userId] = userCart;
    }

    const existingCartItem = userCart.items.find((item) => item.productId === productId);

    if (existingCartItem) {
      existingCartItem.quantity += quantity;
    } else {
      userCart.items.push({ productId, quantity });
    }

    userCart.totalPrice += product.price * quantity;

    await writeDatabase(primaryDBPath, primaryDB);

    res.json(userCart);
  } catch (error) {
    console.error('Error updating user cart in the primary database:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/cart/:userId', async (req, res) => {
  const userId = parseInt(req.params.userId);

  try {
    const primaryDB = await readDatabase(primaryDBPath);
    const userCart = primaryDB.carts[userId];

    if (!userCart) {
      res.status(404).json({ error: 'Cart not found' });
      return;
    }

    res.json(userCart);
  } catch (error) {
    console.error('Error reading user cart from the primary database:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.delete('/cart/:userId/item/:productId', async (req, res) => {
  const userId = parseInt(req.params.userId);
  const productId = parseInt(req.params.productId);

  try {
    let primaryDB = await readDatabase(primaryDBPath);
    let userCart = primaryDB.carts[userId];

    if (!userCart) {
      res.status(404).json({ error: 'Cart not found' });
      return;
    }

    userCart.items = userCart.items.filter((item) => item.productId !== productId);

    userCart.totalPrice = userCart.items.reduce(
      (total, { productId, quantity }) => {
        const product = primaryDB.find((product) => product.id === productId);
        return total + product.price * quantity;
      },
      0
    );

    await writeDatabase(primaryDBPath, primaryDB);

    res.json(userCart);
  } catch (error) {
    console.error('Error updating user cart in the primary database:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
