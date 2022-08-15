const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const Room = new mongoose.Schema({
    name:String,
    description:String,
    major: ObjectId,
    moderators: [ObjectId],
}, { timestamps: true });

module.exports = mongoose.model("Room", Room);