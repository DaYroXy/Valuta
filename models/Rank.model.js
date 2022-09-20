const mongoose = require("mongoose");

const Rank = new mongoose.Schema({
    name: String,
    access: Number,
});

module.exports = mongoose.model("Rank", Rank);