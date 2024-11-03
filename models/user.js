const mongoose = require('mongoose');

mongoose.connect(`mongodb://localhost:27017/User_Post_Project_FullStack`);

const userSchema=({
    username:String,
    name:String,
    age:Number,
    email:String,
    password:String,
    posts:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'post'
    }]

})

module.exports= mongoose.model('user', userSchema);