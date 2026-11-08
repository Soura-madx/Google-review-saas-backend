require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db'); // DB import


const app = express();

// Connect to MongoDB
connectDB();

app.use(cors());
app.use(express.json()); 

// API Routes
app.use('/api/reviews', require('./routes/reviewRoutes')); // Pehle wala Gemini route
app.use('/api/auth', require('./routes/authRoutes'));      // Naya Auth route
app.use('/api/business', require('./routes/businessRoutes'));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));