const express = require('express');

const app = express();
const registryPort = 3002;
const serverPort = 3001;

app.get('/getServer', (req, res) => {
  const serverUrl = `localhost:${serverPort}`;
  res.json({ code: 200, server: serverUrl });
});

app.listen(registryPort, () => {
  console.log(`DNS Registry is running on http://localhost:${registryPort}`);
});
