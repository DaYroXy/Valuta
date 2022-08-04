const mongoose = require("mongoose");

const Friend = new mongoose.Schema({
    requester: { type: mongoose.Types.ObjectId },
    recipient: { type: mongoose.Types.ObjectId },
    status: { type: Number, default: 0 }

    // 0 requested, 1 accepted

}, { timestamps: true });

module.exports = mongoose.model("Friend", Friend);