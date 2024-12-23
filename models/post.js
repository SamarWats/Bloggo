const mongoose = require('mongoose');

// mongoose.connect(`mongodb://localhost:27017/User_Post_Project_FullStack`);

const postSchema=({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    date:{
        type:Date,
        default:Date.now
    },

    content:String,

    likes:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    }]

})

module.exports= mongoose.model('post', postSchema);