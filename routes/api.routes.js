const express = require ("express");
const router = express.Router();
const User = require("../classes/user");

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

router.use(require("./users.routes"));
router.use("/posts", require("./posts.routes"));
router.use("/trends", require("./trends.routes"));
router.use("/entry", require("./entry.routes"));

router.get("/test", async (req, res) => {

    let user = new User();
    await user.getUserById("62ec0348b080c0d85c059230");
    user.addFriend("bashar.shaabi");

    res.json({
        status: "success",
        message: "API is working"
    })
})

module.exports=router;
