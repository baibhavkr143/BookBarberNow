const express=require("express");
const db=require("./db/db_main.js");
const cookieParser=require("cookie-parser");
require("./db/db_customer.js");
const app= new express();

app.use(express.json());
app.use(cookieParser());
app.use(require("./routes/customer/customer.js"));
//app.use(require("./routes/customer/customer_api.js"));

const port=process.env.PORT ||9050;

app.get("/",(req,res)=>{
    res.json({message:"helo from server side"});
})
app.listen(port,()=>{
    console.log(`server is running on port ${port}`);
})