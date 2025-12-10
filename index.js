const express = require('express');
const bodyParser = require('body-parser');  
require('dotenv').config()
const cors = require('cors');
const cookieParser = require("cookie-parser");
const app= express();

const port = process.env.PORT ;


const userRoutes = require('./routes/authRoutes');
// ⭐ Correct CORS Setup
app.use(cors({
  origin: [
    "http://localhost:3000",                 // local frontend
    // process.env.FRONTEND_URL                 // production frontend
  ],
  credentials: true,                         // allow cookies
}));


app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log("Headers:", req.headers);
  console.log("Cookies:", req.cookies);
  next();
});

// ⭐ Cookie parser (you forgot this — REQUIRED for cookies)
app.use(cookieParser());
 
app.use(bodyParser.json());
app.use('/api/v1', userRoutes);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

// Database connection (do NOT call mongoose like a function!)
require('./config/database'); 

app.get('/', (req, res) => {
  res.send('This is raju kumar');
});