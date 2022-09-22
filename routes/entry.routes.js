const express = require ("express");
const router = express.Router();
const Major = require("../classes/major");
const userClass = require("../classes/user");

// Login 
router.post("/login", async (req, res) => {

    const data = {
        username: req.body.username.toString().toLowerCase(),
        password: req.body.password.toString()
    }

    if(data.username === "") {
        res.json({
            status: "error",
            message: "Username is required"
        })
        return;
    }

    if(data.password === "") {
        res.json({
            status: "error",
            message: "Password is required"
        })
        return;
    }

    let user = new userClass();

    if(await user.login(data.username, data.password)) {
        req.session.user = user.getUser();
        req.session.user.rank = (await user.getUserRank()).name;
        req.session.user.posts_count = await user.getUserPostsCount();
        req.session.user.friends_count = await user.getFriendsCount();
        res.redirect("/");
        return
    } else {
        res.redirect("/entry?error=username or password is incorrect");
        return;
    }
})

// Registartion
router.post("/register", async (req, res) => {
    console.log(req.body)
    const data = {
        name: req.body.name,
        username: req.body.username,
        password: req.body.password,
        email: req.body.email,
        majors: req.body.majors,
        bio: "No bio availabe."
    }

    if(!data.name || data.name === "") {
        res.redirect("/entry?registerError=Name is required");
        return;
    }

    let major = new Major().findById(data.majors);
    if(!major) {
        res.redirect("/entry?registerError=Major is invalid");
        return;
    }

    if(data.name.length < 8 || !/^[a-zA-Z0-9 ."-]+$/.test(data.name)) {
        res.redirect("/entry?registerError=Name is invalid");
        return;
    }

    if(!data.username || data.username === "") {
        res.redirect("/entry?registerError=Username is required");
        return;
    }

    if(data.username.length < 6 || !/^[a-zA-Z0-9."-]+$/.test(data.username)) {
        res.redirect("/entry?registerError=Username is invalid");
        return;
    }

    if(!data.email || data.email === "") {
        res.redirect("/entry?registerError=Email is required");
        return;
    }

    if(data.email.length < 10 || !/^[a-zA-Z0-9@."-]+$/.test(data.email)) {
        res.redirect("/entry?registerError=Email is invalid");
        return;
    }

    if(!data.password || data.password === "") {
        res.redirect("/entry?registerError=Password is required");
        return;
    }

    if(data.password.length < 6 || !/^[a-zA-Z0-9 ."-]+$/.test(data.password)) {
        res.redirect("/entry?registerError=Passowrd is invalid");
        return;
    }

    // Registartion
    let user = new userClass()
    console.log(data.majors)
    let result = await user.register({
        name: data.name,
        username: data.username,
        password: data.password,
        email: data.email.toLowerCase(),
        bio: data.bio,
        major: data.majors
    })

    if(result.status !== "success") {
        res.redirect(`/entry?registerError=${result.message}`);
        return user;
    }

    req.session.user = user.getUser();
    req.session.user.rank = (await user.getUserRank()).name;
    res.redirect("/");
})

// Logout
router.put("/logout", async(req,res) => {
    let user = req.session.user
    
    if(!user) {
        return;
    }

    req.session.destroy();
    let me = new userClass()
    await me.getUserById(user.id);
    await me.logout();
    res.redirect("/entry")
})


module.exports=router;