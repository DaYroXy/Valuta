const mongoose = require("mongoose");

const Logs = new mongoose.Schema({
    ip: {type: "String", required: true},
    browser: {type: "String", required: true},
    method: {type: "String", required: true},

}, { timestamps: true });

module.exports = mongoose.model("Logs", Logs);