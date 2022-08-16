const express = require ("express");
const router = express.Router();
const User = require("../classes/user");
const friendModel = require("../models/Friend.model");
const ObjectId = require('mongoose').Types.ObjectId;
const Major = require("../classes/major");
const Room = require("../classes/room");
const Message = require("../classes/message");

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

router.use(require("./users.routes"));
router.use("/posts", require("./posts.routes"));
router.use("/trends", require("./trends.routes"));
router.use("/entry", require("./entry.routes"));
router.use("/friends", require("./friend.routes"));
router.use("/search", require("./search.routes"));
router.use("/messages", require("./messages.routes"));
router.use("/rooms", require("./rooms.routes"));


router.get("/test", async (req,res) => {

    let major = new Major();
    try {
        let years = 3;
        let lecturers = [];
        await major.create("Software Engineering",years, lecturers);
        // console.log(await major.findById("62f83dc0589021a4c888220f"))
    } catch(e) {
        res.json(e.message)
        return;
    }

    res.json({
        status: "sucess",
        message: "Hello World"
    })
})


router.get("/majors", async (req,res) => {
    let major = new Major();
    let rooms = new Room();
    res.json(await rooms.getRelated(await major.getRelated("62fa870c3aa58a6de71b54f2")));
})


module.exports=router;
