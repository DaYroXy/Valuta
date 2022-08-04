const express = require ("express");
const router = express.Router();
const postModel = require("../models/Post.model");
const userModel = require("../models/User.model");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

router.use(require("./users.routes"));
router.use("/posts", require("./posts.routes"));
router.use("/trends", require("./trends.routes"));
router.use("/entry", require("./entry.routes"));

module.exports=router;
