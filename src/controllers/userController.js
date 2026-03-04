const User = require("../models/User");
const { validateCreate, validateUpdate } = require("../validations/userValidation");

async function createUser(req, res, next) {
  try {
    const { isValid, errors } = validateCreate(req.body);
    if (!isValid) {
      return res.status(400).json({ errors });
    }

    const user = await User.create({
      name: req.body.name.trim(),
      email: req.body.email.trim().toLowerCase(),
      birthday: req.body.birthday,
      timezone: req.body.timezone
    });

    return res.status(201).json(user);
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({ error: "Email already exists" });
    }
    return next(err);
  }
}

async function getUsers(req, res, next) {
  try {
    const users = await User.find();
    return res.status(200).json(users);
  } catch (err) {
    return next(err);
  }
}

async function getUser(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.status(200).json(user);
  } catch (err) {
    return next(err);
  }
}

async function updateUser(req, res, next) {
  try {
    const { isValid, errors } = validateUpdate(req.body);
    if (!isValid) {
      return res.status(400).json({ errors });
    }

    if (req.body.email) {
      req.body.email = req.body.email.trim().toLowerCase();
    }

    if (req.body.name) {
      req.body.name = req.body.name.trim();
    }

    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json(user);
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({ error: "Email already exists" });
    }
    return next(err);
  }
}

async function deleteUser(req, res, next) {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser
};
