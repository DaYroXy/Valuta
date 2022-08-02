const express = require ("express");
const router = express.Router();
const postModel = require("../models/Post.model");
const userModel = require("../models/User.model");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

router.use(require("./users.routes"));
router.use("/posts", require("./posts.routes"));
router.use("/entry", require("./entry.routes"));


router.get("/", async (req,res) => {

    const posts = await postModel.aggregate([
        {
            "$lookup": {
              "from": "users",
              "localField": "userId",
              "foreignField": "_id",
              "as": "user"
            }
          },
          {
            "$unwind": "$user"
          },
          {
            "$lookup": {
                "from": "ranks",
                "localField": "user.rank",
                "foreignField": "_id",
                "as": "rank"
            }
          },
          {
            "$unwind": "$rank"      
          },
          {"$project": {
            "_id":1,
            "content":1,
            "image":1,
            "file":1,
            "createdAt": 1,
            "user.name": 1,
            "user.avatar": 1,
            "user.username": 1,
            "rank.name" : 1, 
        }}
        
      ]).sort({"createdAt":1}).limit(10);

    // console.log(Url.url)
    res.json({
        posts
    })
})


module.exports=router;
