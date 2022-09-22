const mongoose = require("mongoose");

const Activity = new mongoose.Schema({
    userId: { type: mongoose.Types.ObjectId },
    message: { type: String },
    status: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("Activity", Activity);