const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Rule 3: Reject any request carrying X-System-Override: true before reaching route handlers
app.use((req, res, next) => {
  if (req.headers['x-system-override'] === 'true') {
    return res.status(418).type('text/plain').send('System override denied');
  }
  next();
});

app.get('/api/cargo', (req, res) => {
  const dataPath = path.join(__dirname, '..', 'output', 'Task 1 - Modugu - Parser.json');
  try {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    res.status(200).json(data);
  } catch (err) {
    console.error('Failed to read cargo data:', err.message);
    res.status(500).json({ error: 'Could not load cargo data' });
  }
});

app.listen(PORT, () => {
  console.log(`Cargo API running on http://localhost:${PORT}`);
});
