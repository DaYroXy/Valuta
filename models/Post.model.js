const mongoose = require("mongoose");

const Post = new mongoose.Schema({
    userId: mongoose.Types.ObjectId,
    content: String,
    image: String,
    file: String,
}, { timestamps: true });

module.exports = mongoose.model("Post", Post);