const mongoose = require('mongoose')

const teamSchema = new mongoose.Schema({
   name:{
    type:String,
    required:true,
    unique:true
   } ,
   members:[{
    type:String,
    required:true
   }],
})
module.exports = mongoose.model('Team',teamSchema)