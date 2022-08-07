const express = require("express");
const router = express.Router();

// const MessageModel = require("../models/Message.model");
const Message = require("../classes/message");
const User = require("../classes/user");
const ObjectId = require("mongoose").Types.ObjectId;

// router.get("/", async (req,res) => {

//     let messages = await Message.find({});

//     res.json(messages)
// })

router.get("/send", async(req,res) => {

    let user = new User();
    await user.getUserById("62ec0348b080c0d85c059230")

    let result = await user.send("62ec0413b080c0d85c059315","5ls yzlmi azbot", "", "");

    if(result) {
        if(result.status === "error") {
            res.json({
                "stauts": "error",
                "message": result.message
            })
            
            return;
        }
    }

    res.json({
        "stauts": "sucess",
        "message": "Message Sent"
    })

})

router.get("/get", async(req,res) => {
    
        let user = new User();
        await user.getUserById("62ec0348b080c0d85c059230")
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

module.exports = router;