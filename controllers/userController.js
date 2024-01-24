// const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../model/userModel");
const { generateToken } = require("../config/jwttoken");

const signup = async (req, res) => {
  try {
    const { username, email, password, phonenumber, college, passingyear } =
      req.body;
    console.log(req.body)
    // Check if user with the same email or phone number already exists
    const existingUser = await User.findOne({
      // $or: [{ email }, { phonenumber }],
      email
    });
    if (existingUser) {
      return res.status(400).json({
        error: "User with this email or phone number already exists.",
      });
    }

    // Hash the password before saving it to the database
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword)
    // Create a new user instance
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      phonenumber,
      college,
      passingyear,
    });

    // Save the user to the database
    await newUser.save();

    // Generate JWT token
    const token = generateToken(newUser._id);

    res.status(201).json({ token, user: newUser,message:'Profile Created' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(req.body)
    // Find user by email or phone number
    // const user = await User.findOne({ email : emailOrPhoneNumber
    //   // $or: [{ email: emailOrPhoneNumber }, { phonenumber: emailOrPhoneNumber }],
    // });
    const user= await User.findOne({
      email
    })
    console.log(user)
    if (!user) {
      return res
        .status(401)
        .json({ error: "Invalid email/phone number or password" });
    }
    // Check if the provided password matches the stored hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);
    console.log(passwordMatch)
    if (!passwordMatch) {
      return res
        .status(401)
        .json({ error: "Invalid email/phone number or password" });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(200).json({ token, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {signin, signup}