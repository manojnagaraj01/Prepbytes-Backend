// const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../model/userModel");
const { generateToken } = require("../config/jwttoken");
const dotenv = require('dotenv').config()




const stripe=require('stripe')(process.env.Stripe);

// console.log(process.env.Stripe)
const signup = async (req, res) => {
  try {
    const { username, email, password, phonenumber, college, passingyear } =
      req.body;
    console.log(req.body);
    // Check if user with the same email or phone number already exists
    const existingUser = await User.findOne({
      // $or: [{ email }, { phonenumber }],
      email,
    });
    if (existingUser) {
      return res.status(400).json({
        error: "User with this email or phone number already exists.",
      });
    }

    // Hash the password before saving it to the database
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword);
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

    res.status(201).json({ token, user: newUser, message: "Profile Created" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(req.body);
    // Find user by email or phone number
    // const user = await User.findOne({ email : emailOrPhoneNumber
    //   // $or: [{ email: emailOrPhoneNumber }, { phonenumber: emailOrPhoneNumber }],
    // });
    const user = await User.findOne({
      email,
    });
    console.log(user);
    if (!user) {
      return res
        .status(401)
        .json({ error: "Invalid email/phone number or password" });
    }
    // Check if the provided password matches the stored hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);
    console.log(passwordMatch);
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

let purchaseCourse = {};
const checkout = async (req, res) => {
  const { products } = req.body;
  const { email } = req.body;
  console.log(req.headers)
  // console.log(req.body);
  // console.log(process.env.Stripe)
  purchaseCourse = products;
  const lineItems = [products].map((product) => ({
    price_data: {
      currency: "inr",
      product_data: {
        name: product.name,
        images: [product.url],
      },
      unit_amount: Math.round(product.price * 100),
    },
    quantity: product.quantity,
  }));
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",  
    success_url:
      "http://localhost:4000/order/success?session_id={CHECKOUT_SESSION_ID}&email=" +
      email,
    cancel_url: `https://prepbytes-clone-three.vercel.app//master-competitive-programming`,
  });
  console.log(session);
  res.json({ id: session?.id, session: session });
};

const order = async (req, res) => {
  let purchaseCourse = {};
  let email = req.query.email;
  let checkUser = await User.findOne({ email: email });
  if (checkUser) {
    let data = {};
    console.log(purchaseCourse);
    checkUser.course
      ? (data = {
        ...checkUser,
        course: [...checkUser.course, purchaseCourse],
      })
      : (data = {
        ...checkUser,
        course: [purchaseCourse],
      });
    console.log(data);
    try {
      await User.updateOne(
        { email: email },
        { $push: { course: purchaseCourse } },
        (err, result) => {
          if (err) {
            console.log(err);
          } else {
            console.log(result);
          }
        }
      );
    } catch (e) {
      console.log(e);
    }
  }
  res.redirect("https://prepbytes-clone-three.vercel.app/dashboard");
};

const offer = async (req, res) => {
  let email = req.body.email;
  let checkUser = await User.findOne({ email: email });
  res.json(checkUser);
};

const enquiryform = async (req, res) => {
  try {
    console.log(req.body);
    await enquiry.insertOne(req.body);
    res.status(200).send("Enquiry Send to host");
  } catch (e) {
    res.status(500);
  }
};


module.exports = { signin, signup,checkout,offer,enquiryform,order };
