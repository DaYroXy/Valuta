const express = require("express");
const router = express.Router();
const User = require("../classes/user");

router.post("/send", async(req,res) => {
    const io = req.app.get("io");
    let me = req.session.user
    if(!me) {
        res.json({
            "status": "error",
            "message": "You are not logged in"
        })
        return;
    }

    const {to, content} = req.body;

    let user = new User();
    await user.getUserById(me.id)
    let result = await user.send(to,content, "", "");
    if(result) {
        if(result.status === "error") {
            res.json({
                "stauts": "error",
                "message": result.message
            })
            
            return;
        }
    }
    
    let userSockets = new User();
    await userSockets.getUserById(to)
    userSockets = await userSockets.getUserSockets()

    if(userSockets.length > 0) {
        userSockets.forEach(socket => {
            io.to(socket).emit("new_message", me.id)
        } )
    }


    res.json({
        "stauts": "sucess",
        "message": "Message Sent"
    })

})

router.get("/get", async(req,res) => {
    
    let me = req.session.user
    if(!me) {
        res.json({
            "status": "error",
            "message": "You are not logged in"
        })
        return;
    }

    let user = new User();
    await user.getUserById(me.id)
    let result = await user.getRecentMessages();

    if(result) {
        if(result.status === "error") {
            res.json({
                "stauts": "error",
                "message": result.message
            })
            
            return;
        }
    }
    res.json(result)
    
})

router.get("/get/:uid", async(req,res) => {

    let me = req.session.user
    if(!me) {
        res.json({
            "status": "error",
            "message": "You are not logged in"
        })
        return;
    }

    const {uid} = req.params;

    if(!uid) {
        res.json({
            "status": "error",
            "message": "Invalid parameters"
        })
        return;
    }

    let user = new User();
    await user.getUserById(me.id)
    let result = await user.getMessagesBetween(uid)
    let userData = await user.returnUserById(uid);
    let userResult = {
        id: userData.id,
        avatar: userData.avatar,
        username: userData.username,
        name : userData.name  , 
        sockets : userData.sockets_id 
    }
    let dataResult = {
        user: userResult,
        data: result
    }
    // let result = await user.getMessagesBetween();
    res.json(dataResult)
})

module.exports = router;