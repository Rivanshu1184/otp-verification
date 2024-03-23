const mongoose = require('mongoose') ;

const userSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true,
    },
    otp:{
        type:Number,
        required:true,
    } ,
    verified:{
        type:Boolean
    }
}) ;


module.exports = mongoose.model("User" , userSchema) ;