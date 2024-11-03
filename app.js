const express = require('express');
const app = express();
const path=require('path');
const userModel = require('./models/user');
const postModel = require('./models/post');
const user = require('./models/user');



const crypto = require('crypto');
const upload = require("./config/multerConfigure")

const jwt= require('jsonwebtoken');
const bcrypt=require('bcrypt');
const cookieParser=require('cookie-parser');
// const { register } = require('module');

const PORT = process.env.PORT || 4000;

app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser());

app.get("/", function(req, res){
    res.render("index")
})

app.get("/login", function(req, res){
    res.render("login")
})

app.get("/profile/upload", function(req, res){
    res.render("profileUpload");
});

app.post('/upload', isLoggedIn, upload.single('image'), async function(req, res){
    let user = await userModel.findOne({email: req.user.email});
    user.profilepic = req.file.filename;
    await user.save();
    res.redirect("/profile");
})

app.get('/profile', isLoggedIn, async function(req, res){
    let user = await userModel.findOne({email: req.user.email}).populate("posts");
    
    res.render("profile", {user});// {user}: it send the whole content of the user.js
})

app.get('/likes/:id', isLoggedIn ,async function(req, res){
    
    let post = await postModel.findOne({_id:req.params.id}).populate("user");
    
    // if (!post) {
    //     return res.status(404).json({ message: 'Post not found' });
    // }

    // if there is no likes to the post, then like the post
    if (post.likes.indexOf(req.user.userid) === -1) {
        post.likes.push(req.user.userid);
    }

    // removes the like of the user
    else{
        post.likes.splice(post.likes.indexOf(req.user.userid), 1);
    }


    await post.save();

    res.redirect("/profile");
    
    
})

app.get("/edit/:id", isLoggedIn ,async function(req, res){
    
    let post = await postModel.findOne({_id:req.params.id}).populate("user");
    
    // it send all the data pf the post to post.js file                
    res.render("edit", {post});
})

app.post("/update/:id",isLoggedIn, async function(req, res){
    //checks if post is present and updates the post
    let post = await postModel.findOneAndUpdate({_id:req.params.id}, {content: req.body.content});
    
    // after updating redirect to the profile page
    res.redirect("/profile")
})

app.post('/post',isLoggedIn, async function(req, res){
    let user = await userModel.findOne({email: req.user.email});
    let {content} = req.body;

    // we created a post and tell the post route who is the user
    let post = await postModel.create({
        user:user._id,
        content,
    })

    // we push the post in user post array
    user.posts.push(post._id);
    await user.save();
    res.redirect("/profile");

})


app.post('/register',async function(req, res){
    let{username, name,age, email, password} =req.body;

    // checks if this email is present or not or the user is already registered or not
    let user = await userModel.findOne({email:email});

    // if user is registered then redirect or send it to the login page
    if(user) return res.status(500).redirect("/profile");

    // if user is not present, then register the user
    bcrypt.genSalt(10, (err,salt)=>{
        bcrypt.hash(password, salt, async(err, hash)=>{
            let user = await userModel.create({
                username:username,
                name:name,
                age:age,
                email:email,
                password:hash, // we will not pass password instead we will give it hash keys
            });

            // now setup the token they will be sent when login to both the database and the user
            let token = jwt.sign({email:email, userid:user._id}, 'myHotKeys');
            res.cookie("token", token);

            // when the user is created redirect it to the profile page
            res.redirect("/profile");
        })
    })

})

app.post('/login', async function(req, res){
    let {email, password}=req.body;

    // check if user is already present or not
    let user = await userModel.findOne({email});

    // if user is not present
    if(!user) return res.status(500).send("Something went wrong!");

    bcrypt.compare(password, user.password, function(err, result){
        // if password matches with the actual password that user created at the time of registration then redirect it to profile page
        if(result){
            let token = jwt.sign({email:email, userid:user._id}, 'myHotKeys');
            res.cookie("token", token);

            res.status(200).redirect("/profile");
        }

        // if user is not present redirect it to registeration page
        else res.redirect("/login");

        // else {
        //     res.status(401).send("Invalid credentials"); // Change to a more informative message
        //     res.redirect("/login");
        // }
    })
    
})

app.get("/logout", function(req, res){
    res.cookie("token","");
    res.redirect("/login");
})


function isLoggedIn(req, res, next){

    if(req.cookies.token === "") res.redirect("/login");

    else{
        let data = jwt.verify(req.cookies.token, 'myHotKeys');
        req.user=data;
        next();
    }
}




app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
