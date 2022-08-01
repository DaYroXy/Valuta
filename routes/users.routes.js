const express = require ("express");
const userClass = require("../classes/user");
const router = express.Router();


router.get("/me", async (req,res) => {
    const userSession = req.session.user;
    
    if(!userSession) {
        res.json({
            status: "error",
            message: "You are not logged in"
        })
        return;
    }

    const user = new userClass();
    await user.getUserById(userSession.id);
    // console.log(user.getUser())
    console.log(await user.getUserPosts())
    res.json("hi!")
})


module.exports=router;