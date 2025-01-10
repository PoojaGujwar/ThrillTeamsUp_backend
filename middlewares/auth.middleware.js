const User = require('../models/user.model')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

module.exports.authUser = async(req,res,next)=>{
    const token = req.headers["authorization"];
    if(!token){
        return res.status(401).json({message:"No token provided"})
    }
    const tokenParts = token.split(" ");
    console.log(tokenParts,"Token",token)
    try{
        const decodedToken = jwt.verify(token,process.env.JWT_SECRET)
        console.log(decodedToken)
        req.user = decodedToken;
        next();
    }catch(error){
        return res.status(402).json({message:"Invalid token"})
    }
}