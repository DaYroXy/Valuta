const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId

const Message = new mongoose.Schema({
    from: ObjectId,
    to: ObjectId,
    content: String,
    image: String,
    file: String
}, { timestamps: true });

module.exports = mongoose.model("Message", Message);