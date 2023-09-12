const db = require("../../db/db_customer.js");
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const auth = require("../../middleWare/customer_middleWare.js");
const multer = require("multer");
const env = require("dotenv");
const router = express.Router();
env.config({ path: "config.env" });

const storage = multer.memoryStorage(); // Store the file in memory as a Buffer
const upload = multer({ storage: storage });

router.get("/customer/home", auth, (req, res) => {
  res.status(200).json({ message: "welcom to customer side ..........." });
});

router.post("/customer/register", upload.single("photo"), async (req, res) => {
  try {
    const data = req.body;
    const email = data.email;
    const photo = req.file;
    //console.log(data);
    if (data.password == data.conformPassword) {
      const find = await db.loginDbCustomer.findOne({ email });
      if (find) {
        res.status(400).json({ message: "user already registered" });
      } else {
        delete data.conformPassword;
        data.password = await bcrypt.hash(data.password, 12);
        //console.log(data.password);
        const doc = new db.loginDbCustomer(data);
        if (photo) {
          doc.photo.data = photo.buffer;
          doc.photo.contentType = photo.mimetype;
        }
        const result = await doc.save();
        if (result)
          res.status(200).json({ message: "registration successful" });
        else res.status(404).json({ message: "user registration failed" });
      }
    } else {
      res.status(400).json({ message: "wrong CredentialsContainer.." });
    }
  } catch (error) {
    console.log(error.message);
    res.status(400).send(error);
  }
});

router.post("/customer/login", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const findUser = await db.loginDbCustomer.findOne({ email });
    if (findUser) {
      const compare = await bcrypt.compare(password, findUser.password);
      if (compare) {
        const loginToken = await jwt.sign(
          { email: findUser.email },
          process.env.jwtKey
        );
        //console.log(loginToken);
        res.cookie("CustomerLogin", loginToken, {
          expires: new Date(Date.now() + 10000 * 60000),
          httpOnly: true,
        });
        res.status(200).json({ message: "Login successful" });
      } else res.status(404).json({ message: "inValid credentials" });
    } else res.status(404).json({ message: "User not found" });
  } catch (error) {
    console.log(`error in login customer ${error.message}`);
    res.status(400).send(error.message);
  }
});
router.post("/customer/updatePassword", async (req, res) => {
  try {
    
     
  } catch (error) {

  }
});

router.get("/customer/logout", (req, res) => {
  res.clearCookie("CustomerLogin");
  res.status(200).json({ messageL: "Logout successfully" });
});
module.exports = router;
