require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:4000').split(',');

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/requests', require('./routes/requests'));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
