const express = require ("express");
const router = express.Router();
const User = require("../classes/user");
const friendModel = require("../models/Friend.model");
const ObjectId = require('mongoose').Types.ObjectId;

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

router.use(require("./users.routes"));
router.use("/posts", require("./posts.routes"));
router.use("/trends", require("./trends.routes"));
router.use("/entry", require("./entry.routes"));
router.use("/friends", require("./friend.routes"));


module.exports=router;
