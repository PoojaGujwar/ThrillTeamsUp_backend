const express = require('express')
const app = express()
const cors = require('cors')
const {initializeDatabase} = require('./db/db.connection')
const User = require("./models/user.model")
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { authUser } = require('./middlewares/auth.middleware')

const SECRET_KEY = "supersecretadmin"

app.use(express.json())
app.use(cors())
initializeDatabase()

app.get("/",(req,res)=>{
    res.send("Hello")
})

app.post("/auth/login", async(req,res)=>{
     const {email,password} = req.body
        try{
            const user = await User.findOne({email})
            if(!user){
                return res.status(401).json({message:"Invalid email or password"})
            }
             const isMatch = await bcrypt.compare(password,user.password)
    
            if(!isMatch){
                return res.status(401).json({message:"Invalid email or password"})
            }
            const token = jwt.sign({userId:user._id.toString(),role:"admin"},process.env.JWT_SECRET,{expiresIn:"24h"})
            console.log(token)
            res.json({token})
        }catch(error){
            res.status(500).json({message:"Internal Server Error"})
        }
   
})
app.post("/auth/signup",async(req,res)=>{
    const {name,email,password} = req.body
    try{
        const existingUser = await User.findOne({email})
        if(existingUser){
            return res.status(400).json({message:"User already exists"})
        }
        const hashedPassword = await bcrypt.hash(password,10)
        const user = new User({
            name,email,password:hashedPassword
        })
        await user.save()
        res.status(201).json(user)
        console.log(user)
    }catch(error){
        res.status(500).json({message:"Internal Server Error"})
    }
    
})
app.get("/auth/api/data",authUser,(req,res)=>{
    res.json({message:"Protected route accessible"})
})
app.get("/auth/me",authUser,async(req,res)=>{
    
    try{
        const finded = await User.findById( req.user.userId)
        console.log(finded)
        if(!finded){
            res.status(402).json({message:"Invalid"})
        }
        const {name, email} = finded
        res.json({name,email})
    }catch(error){
        res.status(500).json({message:"Internal server error",error})
    }
})
app.listen(3000, ()=>console.log('Server is running on 3000'))