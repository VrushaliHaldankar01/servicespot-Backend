const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();

const PORT = process.env.PORT;
const uri = process.env.URI;
const app = express();

app.use(bodyParser.json());

mongoose
  .connect(uri)
  .then(() => {
    console.log('connected to MongoDB Atlas');
  })
  .catch((error) => {
    console.log('error connecting to  MomgoDB databse');
  });

app.get('/', (req, res) => {
  res.send('connected to server');
});

app.listen(4000, () => {
  console.log('server running on port 4000');
});
