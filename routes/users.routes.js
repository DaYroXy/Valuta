const express = require ("express");
const userClass = require("../classes/user");
const router = express.Router();


router.post("/login", async (req, res) => {
    const io = req.app.get('socketio');
    const data = {
        username: req.body.username.toString(),
        password: req.body.password.toString()
    }
    console.log(data)

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

    let user = await new userClass();

    if(await user.login(data.username, data.password)) {
        req.session.user = await user.getUser();
        const SessionId = req.session.id
        res.redirect("/?success=" + SessionId);
        return
    } else {
        res.redirect("/entry?error=username or password is incorrect");
        return;
    }
})

// Registartion
router.post("/register", async (req, res) => {
    const data = {
        name: req.body.name,
        username: req.body.username,
        password: req.body.password,
        email: req.body.email,
        bio: "No bio availabe."
    }

    if(data.name === "") {
        res.redirect("/entry?registerError=Name is required");
        return;
    }

    if(data.name.length < 8 || !/^[a-zA-Z0-9 ."-]+$/.test(data.name)) {
        res.redirect("/entry?registerError=Name is invalid");
        return;
    }

    if(data.username === "") {
        res.redirect("/entry?registerError=Username is required");
        return;
    }

    if(data.username.length < 6 || !/^[a-zA-Z0-9."-]+$/.test(data.username)) {
        res.redirect("/entry?registerError=Username is invalid");
        return;
    }

    if(data.email === "") {
        res.redirect("/entry?registerError=Email is required");
        return;
    }

    if(data.email.length < 10 || !/^[a-zA-Z0-9@."-]+$/.test(data.email)) {
        res.redirect("/entry?registerError=Email is invalid");
        return;
    }

    if(data.password === "") {
        res.redirect("/entry?registerError=Password is required");
        return;
    }

    if(data.password.length < 6 || !/^[a-zA-Z0-9 ."-]+$/.test(data.password)) {
        res.redirect("/entry?registerError=Passowrd is invalid");
        return;
    }




    let user = new userClass()
    let reg = await user.register({
        name: data.name,
        username: data.username,
        password: data.password,
        email: data.email.toLowerCase(),
        bio: data.bio,
    })
    if(typeof reg !== "undefined") {
        if(reg.status === "error") {
            // res.redirect("/entry?registerError=" + reg.message);
            console.log(reg.message)
            return;
        }
    }

    result = await user.getUser();
    console.log(user)


    
    // if(Object.keys(user.getUser()).length === 0) {
        // user = await user.getUser();
    //     console.log(user)

    // }
    // console.log(user.getUser())
    // if(Object.keys(user).length !== 0) {
    //     user = await user.getUser();
    //     req.session.user = user.getUser();

    //     return;
    // } else {
    //     res.json({
    //         status: "error",
    //         message: "Registration failed",
    //     })
    //     return;
    // }
})

// Logout
router.post("/logout", (req,res) => {
    let user = req.session.user
    
    if(!user) {
        return;
    }
    req.session.destroy();
    res.redirect("/entry")
})


module.exports=router;