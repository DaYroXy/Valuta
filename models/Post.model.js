const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId

const Post = new mongoose.Schema({
    userId: mongoose.Types.ObjectId,
    content: String,
    image: String,
    file: String,
    trendId: [{ type: mongoose.Schema.Types.ObjectId, default: null }],
}, { timestamps: true });

module.exports = mongoose.model("Post", Post);