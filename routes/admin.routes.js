const express = require ("express");
const router = express.Router();
const userModel = require("../models/User.model");
const rankModel = require("../models/Rank.model");
const Activity = require("../models/Activity.model");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const Logs = require("../models/Logs.model");
const Major = require("../classes/major");
const majorClass = require("../classes/major")
const Room = require("../classes/room");
const User = require("../classes/user");

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

router.get("/activity/:limit", async (req, res) => {
    const limit = req.params.limit;
    const activities = await Activity.aggregate([
        { $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user"
        }},
        { $unwind: "$user" },
        {
            $project: {
                message: 1,
                status:1,
                userId:1,
                user: {
                    avatar: 1,
                    name: 1
                },
                createdAt: 1
            }
        },
        { $sort: { createdAt: -1 } },
    ]).limit(parseInt(limit));
    res.json(activities);
})

router.get("/recentUsers", async (req,res) => {
    const users = await userModel.aggregate([
        { $sort: { createdAt: -1 } },
        {
            $lookup: {
                from: "ranks",
                localField: "rank",
                foreignField: "_id",
                as: "rank"
            }
        },
        { $unwind: "$rank" },
        {
            $lookup: {
                from: "majors",
                localField: "major",
                foreignField: "_id",
                as: "major"
            }
        },
        { $unwind: "$major" },
        { $project: {
            name: 1,
            username:1,
            email: 1,
            "rank.name":1,
            "major.name":1,
        }},
        { "$group": { 
            "_id": null, 
            "count": { "$sum": 1}, 
            "users": { "$push": "$$ROOT"  }
        },
      }
    ]). limit(8);
    res.json(users[0]);
})


router.get("/graph", (req,res) => {
    // Get monthly graph for each major and return major name
    userModel.aggregate([
        {
            $group: {
                _id: {
                    major: "$major",
                    day: { $dayOfMonth: "$createdAt" },
                    month: { $month: "$createdAt" },
                    year: { $year: "$createdAt" }
                },
                count: { $sum: 1 }
            }
        },
        {
            $project: {
                _id: 1,
                major: "$_id.major",
                day: "$_id.day",
                month: "$_id.month",
                year: "$_id.year",
                count: 1
            }
        },
        {
            $lookup: {
                from: "majors",
                localField: "major",
                foreignField: "_id",
                as: "major"
            }
        },
        {$unwind: "$major"},
        {
            $project: {
                _id: 0,
                major: "$major.name",
                majorId: "$major._id",
                day: 1,
                month: 1,
                year: 1,
                count: 1 
            }  
        },
        {
            $sort: {
                year: -1,
                month: -1,
                day: -1,
            }
        }
    ]).exec((err, result) => {
        if(err) {
            console.log(err)
            res.json({
                status: 500,
                message: "Internal server error"
            })
            return;
        }
        res.json(result);
    })
})

router.get("/logs", async (req,res) => {
    let count = await Logs.find().count()
    Logs.find().sort({createdAt: -1}).limit(8).exec((err, result) => {
        if(err) {
            console.log(err)
            res.json({
                status: 500,
                message: "Internal server error"
            })
            return;
        }
        let r = {
            count: count,
            data: result
        } 
        res.json(r);
    })

})


router.get("/majors", async (req,res) => {
    let majors = await new Major().getMajorGrouped();
    res.json(majors);
})

router.post("/majors/add", async (req,res) => {
    let {name, years, lecturers} = req.body
    
    if(!name || name.trim() === "") {
        res.json({
            status: 400,
            message: "Missing or incorrect name"
        })
        return;
    }

    if(!years || years <= 0) {
        res.json({
            status: 400,
            message: "Missing or incorrect years"
        })
        return;
    }

    if(!lecturers || !Array.isArray(lecturers)) {
        res.json({
            status: 400,
            message: "Missing or incorrect lecturers"
        })
        return;
    }
        
    const major = new Major();
    try {
        await major.create(name, years, lecturers)
        res.json({
            status: "success",
            message: "Major created"
        })
        return;
    } catch (err) {
        res.json({
            status: "error",
            message: err.message
        })
    }
})

router.post("/lecturer/add", async (req,res) => {

    let {username, major} = req.body;
    if(!username || !major) {
        res.json({
            status: 400,
            message: "Missing or incorrect username or major"
        })
        return;
    }
    let foundMajor = await new Major().findMany(major);
    if(foundMajor.length === 0) {
        res.json({
            status: 400,
            message: "Major doesnt exists"
        })
        return;
    }

    let user = new User();
    await user.getUserByUsername(username)
    let userId = user.getUser().id;

    if(!user) {
        res.json({
            status: 400,
            message: "User doesnt exists"
        })
        return;
    }
    
    let isLecturer = false;
    foundMajor.map(async major => {
        major.lecturers.map(e => {
            if(e.equals(userId)) {
                isLecturer = true;
            }
        })

        if(!isLecturer) {
            major.lecturers.push(userId);
            await major.save();
        }
    })

    await user.updateUserRank("lecturer")
    

    res.json({
        status: "success",
        message: "Lecturer added"
    })
})


router.post("/lecturer/remove", async (req,res) => {

    let {username, major} = req.body;
    if(!username || !major) {
        res.json({
            status: 400,
            message: "Missing username or major"
        })
        return;
    }

    let foundMajor = await new Major().findMany(major);
    if(foundMajor.length === 0) {
        res.json({
            status: 400,
            message: "Major doesnt exists"
        })
        return;
    }

    let user = new User();
    await user.getUserByUsername(username)
    let userId = user.getUser().id;

    if(!user) {
        res.json({
            status: 400,
            message: "User doesnt exists"
        })
        return;
    }
    
    let isLecturer = false;
    foundMajor.map(async major => {
        major.lecturers.map(e => {
            if(e.equals(userId)) {
                isLecturer = true;
            }
        })

        if(isLecturer) {
            // remove from array
            major.lecturers.pop(userId);
            await major.save();
        }
    })

    await user.updateUserRank("student")
    

    res.json({
        status: "success",
        message: "Lecturer removed"
    })
})


module.exports = router;