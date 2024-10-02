const express = require('express');
const next = require('next');
const { Pool } = require('pg');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const pool = new Pool({
  user: 'your_db_user',
  host: 'localhost',
  database: 'your_db_name',
  password: 'your_db_password',
  port: 5432,
});

app.prepare().then(() => {
  const server = express();

  server.use(express.json());

  // Your API routes
  server.post('/api/submit-kyc', async (req, res) => {
    // Your KYC submission logic here
  });

  server.get('/api/get-kyc', async (req, res) => {
    // Your KYC retrieval logic here
  });

  // Handle all other routes with Next.js
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});