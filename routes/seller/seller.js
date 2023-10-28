const db = require("../../db/db_seller.js");
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodeMailer = require("../customer/emailSender.js");
const auth = require("../../middleWare/seller_middleWare.js");
const multer = require("multer");
const env = require("dotenv");
const router = express.Router();
env.config({ path: "config.env" });

const storage = multer.memoryStorage(); // Store the file in memory as a Buffer
const upload = multer({ storage: storage });

router.post("/seller/register", upload.single("photo"), async (req, res) => {
  try {
    const data = req.body;
    const email = req.body.email;
    const photo = req.file;
    const result = await db.sellerLoginData.findOne({ email });
    if (result) {
      res.status(400).json({ message: "user already registered" });
    } else {
      if (data.password == data.confirmPassword) {
        data.password = await bcrypt.hash(data.password, 12);
        delete data.confirmPassword;
        const doc = new db.sellerLoginData(data);
        if (photo) {
          doc.photo.data = photo.buffer;
          doc.photo.contentType = photo.mimetype;
        }
        const result = await doc.save();
        if (result) res.status(200).json({ message: "success in upload" });
        else res.status(404).json({ message: "error in upload" });
      } else res.status(404).json({ message: "error in upload" });
    }
  } catch (error) {
    res.status(404).json({ message: `error in upload in seller ${error}` });
  }
});

router.post("/seller/login",async(req,res)=>{
    try {
        const data=req.body;
        const email=data.email;
        const result=await db.sellerLoginData.findOne({email});
        if(result)
        {
            var compare=await bcrypt.compare(data.password,result.password);
            if(compare){
                const loginCookie=await jwt.sign({email:result.email},process.env.jwtKey);
                res.cookie("sellerLogin",loginCookie,{
                    expires:new Date(Date.now()+1000*60*50),
                    httpOnly:true
                });
                res.status(200).json({message:"Login successful"});
            }
            else res.status(400).json({message:"bad request"});
        }else res.status(400).json({message:"user does not exist"});

    } catch (error) {
        res.status(404).json({message:`error in login seller ${message}`});
    }
})

router.post("/seller/updatePassword", async (req,res)=>{
    try {
        const email=req.body.email;
        const password=req.body.password;
        const newPassword=req.body.newPassword; 
        const user=db.sellerLoginData.findOne({email});
        if(user)
        {
            var compare=await bcrypt.compare(password,user.password);
            if(compare)
            {
                user.password=await bcrypt.hash(newPassword,12);
                const result=await user.save();
                if(result)res.status(200).json({message:"sucess in update password"});
                else res.status(404).json({message:"error in update password"});
            }else res.status(404).json({message:"error in update password"});
        }
    } catch (error) {
        res.status(404).json({message:`Error updating password ${error}`});
    }
})


module.exports = router;
