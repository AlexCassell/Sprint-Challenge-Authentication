const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const User = require('../models/userModels');
const { mysecret } = require('../../config');
const SaltRounds = 11;

const sendError = (err, res) => {
  res.status(422);
  if (err && err.message) {
    res.json({ message: err.message, stack: err.stack });
  } else {
    res.json({ error: err });
  }
};

const authenticate = (req, res, next) => {
  const token = req.get('Authorization');
  if (token) {
    jwt.verify(token, mysecret, (err, decoded) => {
      if (err) return res.status(422).json(err);
      req.decoded = decoded;
      next();
    });
  } else {
    return res.status(403).json({
      error: 'No token provided, must be set on the Authorization Header'
    });
  }
};

const encryptUserPW = (req, res, next) => {
  const { username, password } = req.body;
  if (!password) {
    sendError('Incorrect entry, Please try again.', res);
    return;
  }
  bcrypt
    .hash(password, SaltRounds)
    .then((pw) => {
      req.password = pw;
      next();
    })
    .catch((err) => {
      throw new Error(err);
    });
};

const compareUserPW = (req, res, next) => {
  const { username, password } = req.body;
  if (!username) {
    sendError('Incorrect entry, Please try again.', res);
    return;
  }
  User.findOne({ username }, (err, user) => {
    if (err || user === null) {
      sendError('Incorrect entry, Please try again.', res);
      return;
    }
    const hashed = user.passwordHash;
    bcrypt
      .compare(password, hashed)
      .then((response) => {
        if (!response) throw new Error();
        req.username = user.username;
        next();
      })
  });
  
};

module.exports = {
  authenticate,
  encryptUserPW,
  compareUserPW
};