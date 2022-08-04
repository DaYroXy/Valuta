const mongoose = require("mongoose");

const Trend = new mongoose.Schema({
    name: String,
    popularity: Number
});

module.exports = mongoose.model("Trend", Trend);