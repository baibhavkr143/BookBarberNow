const express=require("express");
const db=require("./db/db_main.js");
require("./db/db_customer.js");
const app= new express();

const port=process.env.PORT ||9050;

app.get("/",(req,res)=>{
    res.json({message:"helo from server side"});
})
app.listen(port,()=>{
    console.log(`server is running on port ${port}`);
})