const express = require('express');
const bodyParser = require('body-parser');  
require('dotenv').config()
const app= express();

const port = process.env.PORT ;

app.get('/', (req, res) => {
  res.send('This is raju kumar');
});

app.get('/login', (req, res) => {
  res.send('<h1>this is login page</h1>');
});
app.get('/signup', (req, res) => {
  res.send('<h1>this is login page</h1>');
});


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});