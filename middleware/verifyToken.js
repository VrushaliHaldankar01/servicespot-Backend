const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.send('Token not available');
  }
  jwt.verify(token, process.env.SECRET, (err, decoded) => {
    if (err) {
      res.send('invalid token');
    }
    req.userId = decoded._id;
    next();
  });
};

module.exports = verifyToken;
