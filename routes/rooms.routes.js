
const express = require ("express");
const router = express.Router();
const ObjectId = require("mongoose").Types.ObjectId;
const Room = require("../classes/room");
const Message = require("../classes/message");


// router.get("/", async (req,res) => {

//     const trend = new Trend();

//     if(req.query) {
//         const {skip = 0, limit = 5} = req.query;
//         res.json( await trend.getTrendsLimitAndSkip(skip, limit));
//         return;
//     }

//     res.json( await trend.getTrends());
// })

// Find room by id
router.get("/:roomId", async (req,res) => {
    const {roomId} = req.params;

    if(!ObjectId.isValid(roomId)) {
        res.json({
            "status": "error",
            "message": "Invalid Room Id"
        })
        return;
    }

    const room = new Room();
    let result = await room.findById(roomId)
    if(!result) {
        res.json({
            "status": "error",
            "message": "Room not found"
        })
        return;
    }

    // Hide unnecessary info
    const values = {
        "id": result._id,
        "name": result.name,
        "description": result.description,
    }

    res.json(values);
})


router.get("/messages/:roomId", async (req,res) => {
    const {roomId} = req.params;
    
    if(!ObjectId.isValid(roomId)) {
        res.json({
            "status": "error",
            "message": "Invalid Room Id"
        })
        return;
    }

    let message = new Message();
    let response = await message.getRoomMessages(roomId);
    res.json(response)
})


module.exports=router;