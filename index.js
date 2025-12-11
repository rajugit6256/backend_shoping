const express = require('express');
const bodyParser = require('body-parser');  
require('dotenv').config()
const cors = require('cors');
const cookieParser = require("cookie-parser");
const app= express();

const port = process.env.PORT ;


const userRoutes = require('./routes/authRoutes');
// ⭐ Correct CORS Setup
// app.use(cors({
//   origin: [
//     "http://localhost:3000",                 // local frontend
//     // process.env.FRONTEND_URL                 // production frontend
//   ],
//   credentials: true,                         // allow cookies
// }));

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
}));

// ⭐ FIX: These headers MUST be here for cookies to work cross-site
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Headers", "Content-Type");
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