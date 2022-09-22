const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const Like = new mongoose.Schema({
    userId:ObjectId,
    postId:ObjectId,
}, { timestamps: true });

module.exports = mongoose.model("Like", Like);