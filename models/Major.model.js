const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const Major = new mongoose.Schema({
    name:String,
    year:Number,
    lecturers: [ObjectId]
}, { timestamps: true });

module.exports = mongoose.model("Major", Major);