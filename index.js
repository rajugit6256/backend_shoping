const express = require('express');
const bodyParser = require('body-parser');  
require('dotenv').config()
const app= express();

const port = process.env.PORT ;


const userRoutes = require('./routes/authRoutes');
 
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