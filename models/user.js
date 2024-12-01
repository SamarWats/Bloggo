const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Use environment variable for the database URL
const DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost:27017/User_Post_Project_FullStack';

// Connect to the database
mongoose.connect(DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Database connection successful!');
}).catch((error) => {
    console.error('Database connection error:', error.message);
});

// Define the user schema
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    age: {
        type: Number,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    profilepic: {
        type: String,
        default: "default.png",
    },
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'post',
    }],
}, { timestamps: true }); // Adds createdAt and updatedAt fields

// Export the user model
module.exports = mongoose.model('User', userSchema);
