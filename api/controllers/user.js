const User = require('../models/userModels');
const bcrypt = require('bcrypt');

const createUser = (req, res) => {
  const { username } = req.body;
  const passwordHash = req.password;
  const newUser = new User({ username, passwordHash });
  newUser.save((err, savedUser) => {
    if (err) {
      res.status(422);
      res.json({ 'Missing Required Fields.': err.message });
      return;
    }
    res.json(savedUser);
  });
};

export default createUser;