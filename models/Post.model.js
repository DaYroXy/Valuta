const mongoose = require("mongoose");

const Post = new mongoose.Schema({
    userId: String,
    content: String,
    image: String,
    file: String,
    createdAt: String
});

module.exports = mongoose.model("Post", Post);