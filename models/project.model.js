const mongoose = require('mongoose')

const projectSchema = new mongoose.Schema({
    name:{ type: String, required: true, unique: true },
    description: { type: String },
    createdAt: { type: Date, default: Date.now },
     team:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Team",
            required:true
        }
})
module.exports = mongoose.model('Project',projectSchema)