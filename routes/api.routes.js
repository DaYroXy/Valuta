const express = require ("express");
const router = express.Router();
const Post = require("../classes/post");

router.use(require("./users.routes"));
router.use("/posts", require("./posts.routes"));
router.use("/entry", require("./entry.routes"));

module.exports=router;
