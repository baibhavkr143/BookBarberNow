const db = require("../../db/db_seller.js");
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodeMailer = require("../customer/emailSender.js");
const auth = require("../../middleWare/seller_middleWare.js");
const multer = require("multer");
const { Mutex } = require('async-mutex');
const env = require("dotenv");
const router = express.Router();
env.config({ path: "config.env" });

const storage = multer.memoryStorage(); // Store the file in memory as a Buffer
const upload = multer({ storage: storage });

const registerSeats = async (data,start) => {
  try {
    const email = data.email;
    const numSeats = data.numSeats;
    for (let i = start; i < numSeats; i++) {
      const newSeat = {
        seatNumber: i,
        email: email,
        bookings: new Array(11).fill(true), // Initialize bookings with 11 elements
      };

      const doc = new db.seat(newSeat);
      await doc.save();
    }
  } catch (error) {
    throw error;
  }
};
router.post(
  "/seller/shop/registerShop",
  upload.array("photos", 5),
  async (req, res) => {
    try {
      const data = req.body;
      const email = data.email;
      const shop =await  db.barberShop.findOne({ email });
      if (shop) {
        res.status(400).json({ message: "shop already registered" });
      } else {
        const newShop = new db.barberShop(data);
        req.files.forEach((file) => {
          newShop.photos.push({
            data: file.buffer,
            contentType: file.mimetype,
          });
        });
        await newShop.save();

        await registerSeats(data,0);
        res.status(200).json({ message: "success in register" });
      }
    } catch (error) {
      res.status(400).send(error);
      console.log(error);
    }
  }
);

router.post("/seller/shop/changeDescription",async (req,res)=>{
    try {
        const data=req.body;
        console.log(data);
        const email=data.email;
        const user=await db.barberShop.findOne({email});
        if(!user)
        {
            res.status(400).json({message:"bad request"});
        }
        else {
            user.description=data.description;
            await user.save();
            memoizeShopDetails.invalidate(email);
            res.status(200).json({message:"success in changing description"});
        }
    } catch (error) {
        res.status(400).send(error);
    }
})
router.post("/seller/shop/updatePhoto",upload.array("photos",5),async (req,res)=>{
    try {
        const email=req.body.email;
        const user=await db.barberShop.findOne({email});
        if(user)
        {
            user.photos=[];
            req.files.forEach((file) => {
                user.photos.push({
                  data: file.buffer,
                  contentType: file.mimetype,
                });
              });  
              await user.save();
              memoizeShopDetails.invalidate(email);
              res.status(200).json({message:"sucess in updating shop photos"});
        }
        else res.status(404).json({message:"shop not found"});

    } catch (error) {
        res.status(404).send(error);
    }
})


const memoizeShopDetails={
    cache:new Map(),
    async get(email)
    {
        try {
           if(this.cache.has(email))
           return this.cache.get(email);
        
           const data=await db.barberShop.findOne({email});
           if(data)
           this.cache.set(email, data);
           return data;
        } catch (error) {
            throw error;
        }
    },
    invalidate(email){
        this.cache.delete(email);
    }
}

router.get("/seller/shop/:email",async (req,res)=>{
    try {
        const email = req.params.email;
        const data=await memoizeShopDetails.get(email);
        res.status(200).send(data);
    } catch (error) {
        res.status(400).send(error);
    }
})



// Create a map to store locks for each seat and email combination
const seatLocks = new Map();

router.post("/seller/shop/bookSeat", async (req, res) => {
    try {
        const email = req.body.email;
        const seatNumber = parseInt(req.body.seatNumber);
        const slot = parseInt(req.body.slot);

        // Generate a unique key for the seat and email combination
        const lockKey = `${email}_${seatNumber}_${slot}`;

        // Get or create a lock for the specific seat and email combination
        if (!seatLocks.has(lockKey)) {
            seatLocks.set(lockKey, new Mutex());
        }

        // Use the seat-specific lock to ensure only one request can access the critical section at a time
        const seatMutex = seatLocks.get(lockKey);
        const release = await seatMutex.acquire();

        try {
            var findSeat = await db.seat.findOne({ email, seatNumber });
            console.log(findSeat);
            if (findSeat) {
                if (findSeat.bookings[slot]) {
                    findSeat.bookings[slot] = false;
                    await findSeat.save();
                    res.status(200).json({ message: "Seat booked successfully" });
                } else {
                    res.status(400).json({ message: "Seat not booked" });
                }
            } else {
                res.status(404).json({ message: "Error in bookings" });
            }
        } finally {
            // Release the seat-specific lock to allow other requests to access the critical section
            release();
        }
    } catch (error) {
        res.status(400).send(error);
    }
});

module.exports = router;
