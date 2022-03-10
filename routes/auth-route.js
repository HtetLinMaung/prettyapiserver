const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Owner = require("../models/Owner");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { ownerid, name, password, profile } = req.body;

    let owner = await Owner.findOne({ ownerid });
    if (owner) {
      return res.status(400).json({
        code: 400,
        message: "User already exist",
      });
    }
    const hashedPwd = await bcrypt.hash(password, 12);
    owner = new Owner({
      ownerid,
      name,
      password: hashedPwd,
      profile,
      apis: [],
    });
    await owner.save();
    res.status(201).json({
      message: "User created successfully",
      code: 201,
      data: owner,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message, code: 500 });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { ownerid, password } = req.body;
    const owner = await Owner.findOne({ ownerid });
    if (!owner) {
      return res.status(400).json({
        code: 400,
        message: "User does not exist",
      });
    }
    const isMatch = await bcrypt.compare(password, owner.password);
    if (!isMatch) {
      return res.status(400).json({
        code: 400,
        message: "Invalid password",
      });
    }
    const token = jwt.sign(
      {
        ownerid: owner._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );
    res.json({
      code: 200,
      message: "User logged in successfully",
      data: {
        token,
        profile: owner.profile,
        name: owner.name,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message, code: 500 });
  }
});

module.exports = router;
