const mongoose=require('mongoose');
mongoose.connect('mongodb://0.0.0.0:27017/SOYO',{useNewUrlParser:true,useUnifiedTopology:true}).then(()=>{
    console.log('Connected to MongoDB');
}).catch((error)=>{
    console.log(error.message);
});

module.exports=mongoose;