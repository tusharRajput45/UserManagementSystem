const mongoose = require('mongoose');
const userSchema =new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    PhoneNumber:{
        type:String,
        default:''
    },
    image:{
        type:String,
        default:''
    },
    password:{
        type:String,
    
    },
    isadmin:{
        type:Number,
        required:true,
        default:0
    },
    isverified:{
        type:Number,
        required:true,
        default:0
    },
    jwtToken:{
        type:String,
    },
    randomstring:{
        type:String
    },
    googleId:{
        type:String
    }
})
const User = new mongoose.model("user",userSchema);
module.exports=User;