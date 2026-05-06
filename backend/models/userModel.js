import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique : [true,"Username already exist."]
    },
    email: {
        type: String,
        required: true,
        unique : [true,"Account already exists with this email address."]
    },
    password:{
        type:String,
        required:true,
    },
    },
{timestamps:true});
export const User = mongoose.model('User', userSchema);