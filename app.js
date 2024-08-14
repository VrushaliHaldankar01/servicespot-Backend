const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();
// const cors = require('cors');
// const corsConfig = {
//   origin: '*',
//   credential: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
// };
// app.options('', cors(config));
// app.use(cors(corsConfig));
//user Routes
const userRouter = require('./router/user');

//vendor Routes
const vendorRouter = require('./router/vendor');

//admin Routes
const adminRouter = require('./router/admin');

const PORT = process.env.PORT;
const uri = process.env.URI;
const app = express();
const cors = require('cors');
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads')); // Serve static files
app.use(cors());

mongoose
  .connect(uri)
  .then(() => {
    console.log('connected to MongoDB Atlas');
  })
  .catch((error) => {
    console.log('error connecting to  MomgoDB databse');
  });
app.use('/user', userRouter);

app.use('/vendor', vendorRouter);

app.use('/admin', adminRouter);

app.get('/', (req, res) => {
  res.send('connected to server');
});

app.listen(4000, () => {
  console.log('server running on port 4000');
});
