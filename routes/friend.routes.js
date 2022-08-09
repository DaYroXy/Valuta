const express = require ("express");
const router = express.Router();
const User = require("../classes/user");

router.post("/add", async (req, res) => {

    const io = req.app.get("io");

    const user = req.session.user
    if(!user) {
        res.redirect("/entry")
        return;
    }

    const {recipient} = req.body;

    let me = new User();
    await me.setUser(user.id);
    let friend_status = await me.addFriend(recipient);

    if(friend_status.status === "success") {

        const requestStatus = {
            user: recipient,
            status: (friend_status.message === "Friend request sent") ? "sent" : "accepted"
        }

        let recipientSockets = new User();
        await recipientSockets.setUser(recipient);


        let userSockets = await recipientSockets.getUserSockets()
        if(userSockets){
            userSockets.forEach(socket => {
                io.to(socket).emit("friend_request", {requestStatus})
            })
        }

        let mySockets = await me.getUserSockets()
        if(mySockets){
            mySockets.forEach(socket => {
                io.to(socket).emit("friend_request", {requestStatus})
            })
        }
        
    }

    res.json(friend_status)
})

router.delete("/remove/:username", async (req, res) => {

    const io = req.app.get("io");

    const user = req.session.user
    if(!user) {
        res.redirect("/entry")
        return;
    }

    const {username} = req.params;
    let me = new User();
    await me.setUser(user.id);

    let removedUser = await me.remove(username);
    if(removedUser.status === "success") {

        const requestStatus = {
            user: username,
            status: "removed"
        }

        let recipientSockets = new User();
        await recipientSockets.setUser(username);


        let userSockets = await recipientSockets.getUserSockets()
        if(userSockets){
            userSockets.forEach(socket => {
                io.to(socket).emit("friend_request", {requestStatus})
            })
        }

        let mySockets = await me.getUserSockets()
        if(mySockets){
            mySockets.forEach(socket => {
                io.to(socket).emit("friend_request", {requestStatus})
            })
        }
        
    }
    res.json()
})

router.get("/get", async (req,res ) => {

    const user = req.session.user
    if(!user) {
        res.redirect("/entry")
        return;
    }

    let me = new User();
    await me.setUser(user.id);
    let friends = await me.getFriends();
    
    res.json(friends)

})

module.exports=router;
