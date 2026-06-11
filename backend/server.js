const dotenv = require('dotenv');  // ← Line 1 pe aao
dotenv.config();                   // ← Line 2 pe config

const dns = require('node:dns/promises');
dns.setServers(["1.1.1.1", "1.0.0.1"]);

const express = require('express');
const cors = require('cors');

const connectDB = require('./config/db');
const apiRoutes = require('./routes/api');
const errorHandler = require('./middleware/errorHandler');
const { invokeGrok } = require('./utils/grokClient');

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', apiRoutes);

app.get('/test-grok', async (req, res) => {
  try {
    const result = await invokeGrok('Hello');
    res.json({ success: true, response: result });
  } catch (error) {
    console.error('GROK TEST ERROR:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/', (req, res) => {
  res.send('Carbon Tracker API is running');
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});