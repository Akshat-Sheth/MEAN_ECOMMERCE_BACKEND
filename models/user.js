const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    passwordHash:{
        type:String,
        required:true
    },
    phone:{
        type:Number,
        required:true
    },
    isAdmin:{
        type:Boolean,
        default:false
    },
    street:{
        type:String,
        default:""
    },
    apartment:{
        type:String,
        default:""
    },
    zip:{
        type:String,
        default:""
    },
    country:{
        type:String,
        default:""
    }
})

exports.User = mongoose.model('User', userSchema);
