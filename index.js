const express = require('express')
const app = express()
const cors = require('cors')
const {initializeDatabase} = require('./db/db.connection')
const User = require("./models/user.model")
const Tasks = require("./models/tasks.model")
const Tag = require("./models/tag.model")
const Team = require("./models/team.model")
const Project = require("./models/project.model")
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { authUser } = require('./middlewares/auth.middleware')

const SECRET_KEY = "supersecretadmin"


app.use(cors({
    origin:"*",
    methods:["GET","POST"],
    allowedHeaders:["Content-Type","Authorization"]
}))
app.use(express.json())
initializeDatabase()

app.get("/",(req,res)=>{
    res.send("Hello")
})

app.post("/auth/login", async(req,res)=>{
     const {email,password} = req.body
        try{
            const user = await User.findOne({email})
            if(!user){
                return res.status(404).json({error:"Invalid email or password"})
            }
             const isMatch = await bcrypt.compare(password,user.password)
    
            if(!isMatch){
                return res.status(404).json({error:"Invalid email or password"})
            }
            const token = jwt.sign({userId:user._id.toString(),role:"admin"},process.env.JWT_SECRET,{expiresIn:"24h"})

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
            return res.status(404).json({error:"User already exists"})
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
        if(!finded){
            res.status(404).json({error:"User not found"})
        }

        const {name, email} = finded
        res.status(200).json({name,email})
    }catch(error){
        res.status(500).json({message:"Internal server error",error})
    }
})
app.get("/users",authUser,async(req,res)=>{
    try{
        const user = await User.find()
        res.status(200).json(user)
    }catch(error){
        res.status(500).json({error:"Internal Server Error"})
    }
})
app.post("/tasks" ,async(req,res)=>{
    console.log(req.body)
    try{
        const task = new Tasks(req.body)
        await task.save()
        res.status(201).json(task)
    }catch(error){
        console.log(error)
        res.status(500).json({message:"Internal server error"})
    }
})
app.get("/tasks" ,authUser,async(req,res)=>{
    try{
    const { team, owners, tags, project, status } = req.query;
    let filter = {};
    if (team) filter.team = team;
    if (owners) filter.owners = owners;
    if (tags) filter.tags = { $in: tags.split(",") }; 
    if (project) filter.project = project;
    if (status) filter.status = status;

    const tasks = await Tasks.find(filter)
    if (!tasks.length) {
      return res.status(404).json({ error: "No tasks found with the given filters" });
    }
    res.status(200).json(tasks);
    }catch(error){
            res.status(500).json({message:"Internal Server Error"})
        }
    
})
app.post("/tasks/:id",async(req,res)=>{
    const taskId = req.params.id
    const updateTask = req.body
    try{
        const task = await Tasks.findByIdAndUpdate(taskId,updateTask,{new:true})
        if(!task){
            return res.status(404).json({error:"Task not found"})
        }
        res.status(202).json(task)

    }catch(error){
        res.status(500).json({error:"Internal Server Error"})
    }
})
app.delete("/tasks/:id",async(req,res)=>{
    const taskId = req.params.id
    try{
        const task = await Tasks.findByIdAndDelete(taskId)
        if(!task){
            return res.status(404).json({error:"Task not found"})
        }
        res.status(201).json({message:"Task deleted successfully", task})

    }catch(error){
        res.status(500).json({error:"Internal Server Error"})
    }
})

app.get("/tags",authUser,async(req,res)=>{
    try{
        const tag = await Tag.find()
        res.status(202).json(tag)
    }catch(error){
        res.status(500).json({error:"Internal Server Error"})
    }
})
app.post("/tags",async(req,res)=>{
    const {name } = req.body
    try{
        const tag= new Tag({name})
        await tag.save()
        res.status(201).json(tag)
    }catch(error){
        res.status(500).json({message:"Internal server error"})
    }
})
app.get("/teams",authUser,async(req,res)=>{
    try{
        const team = await Team.find()
        res.status(202).json(team)
    }catch(error){
        res.status(500).json({error:"Internal Server Error"})
    }
})
app.post("/teams/:id",async(req, res)=>{
    const teamId = req.params.id
    const newMember = req.body.members
    console.log(newMember)
    try{
        const team = await Team.findById(teamId)
        if(!team){
            return res.status(404).json({error:"Team not found"})
        }
        team.members.push(newMember)
        const updatedData = await team.save()
        if (!updatedData) {
            return res.status(404).json({ error: "Cannot be updated" });
        }
        res.status(202).json(updatedData)
    }
    catch(error){
        res.status(500).json({error:"Internal Server Error"})
    }
})
app.post("/teams",async(req,res)=>{
    try{
        const team = new Team(req.body)
        await team.save()
        res.status(201).json(team)
    }catch(error){
        res.status(500).json({message:"Internal server error"})
    }
})
app.post("/projects",async(req,res)=>{
    try{
        const project = new Project(req.body)
        await project.save()
        res.status(201).json(project)
    }catch(error){
        res.status(500).json({message:"Internal Server Error"})
    }
})
app.get("/projects",authUser,async(req,res)=>{
    try{
        const project = await Project.find()
        if(!project){
            return res.status(404).json({error:"Project not available"})
        }
        res.status(202).json(project)
    }catch(error){
        res.status(500).json({error:"Internal Server Error"})
    }
})
app.get("/report/lastweek",authUser,async(req,res)=>{
    try{
        const task = await Tasks.find({ status: 'Completed', updatedAt: { $gte: new Date(new Date() - 7 * 24 * 60 * 60 * 1000) } })
        if(!task){
            res.status(404).json({error:"Any task is not completed right now"})
        }
        res.status(202).json({
            message: "Tasks completed in the last week.",task})
    }catch(error){
        res.status(500).json({error:"Internal Server Error"})
    }
})
app.get("/report/pending",authUser,async(req,res)=>{
    try{
        const task = await Tasks.find()
        const calculate = task.reduce((acc,curr)=> (curr.status === 'Completed')?(acc + curr.timeToComplete):acc, 0)
        console.log(calculate)
         res.status(202).json(calculate)
    }catch(error){
        res.status(500).json({error:"Internal Server Error"})
    }
})


app.listen(3000, ()=>console.log('Server is running on 3000'))