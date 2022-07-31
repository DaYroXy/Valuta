const mongoose = require("mongoose");

const User = new mongoose.Schema({
    avatar: String,
    bg_image: String,
    name: String,
    username: String,
    password: String,
    email: String,
    rank: Number,
    bio: String,
    sockets_id: [String]
}, { timestamps: true });

module.exports = mongoose.model("User", User);