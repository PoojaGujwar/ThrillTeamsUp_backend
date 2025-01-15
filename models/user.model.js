const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
    fullname:{
        firstname:{
            type:String,
            required:true
        },
        lastname:{
            type:String
        }
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String
    }
})

module.exports  = mongoose.model('User',userSchema)
