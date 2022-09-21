const express = require ("express");
const router = express.Router();
const userModel = require("../models/User.model");
const rankModel = require("../models/Rank.model");

router.get("/list/users", async (req, res) => {
    
    const users = await userModel.find();
    const online = await userModel.find({ sockets_id: { $exists: true, $not: {$size: 0} } });
    
    const result = {
        total: users.length,
        online: online.length
    }

    res.json(result);
})

router.get("/list/lecturers", async (req, res) => {
    
    const usersRank = await rankModel.findOne({name: "lecturer"}, {_id:1});
    if(!usersRank) {
        res.json({
            status: 404,
            message: "Rank not found"
        })
        return;
    }
    const users = await userModel.find({rank:usersRank._id});
    const online = await userModel.find({rank:usersRank._id, sockets_id: { $exists: true, $not: {$size: 0} } });
    
    const result = {
        total: users.length,
        online: online.length
    }

    res.json(result);
})

router.get("/list/admins", async (req, res) => {
    
    const usersRank = await rankModel.findOne({name: "admin"}, {_id:1});
    if(!usersRank) {
        res.json({
            status: 404,
            message: "Rank not found"
        })
        return;
    }
    const users = await userModel.find({rank:usersRank._id});
    const online = await userModel.find({rank:usersRank._id, sockets_id: { $exists: true, $not: {$size: 0} } });
    
    const result = {
        total: users.length,
        online: online.length
    }

    res.json(result);
})

module.exports = router;