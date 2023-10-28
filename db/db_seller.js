const mongoose=require("./db_main.js");

const sellerLoginSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    Photo:{
        data:Buffer,
        contentType:String
    },
    password:{
        type:String,
        required:true
    }

})

const sellerLoginData=new mongoose.model("sellerLoginData",sellerLoginSchema);

module.exports={sellerLoginData};

