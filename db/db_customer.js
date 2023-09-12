const mongoose = require("./db_main.js");
const loginSchema = new mongoose.Schema({
  name :{
    type :String,
    required :true
  },
  email: {
    type: String,
    required: true,
    unique :true
  },
  password: {
    type: String,
    required: true,
  },
  photo: {
    data: Buffer, // Store binary data of the image
    contentType: String, // Store the content type of the image (e.g., "image/jpeg", "image/png")
  }
});

const loginDbCustomer = new mongoose.model("loginDbCustomer", loginSchema);

module.exports = {
  loginDbCustomer
};
