const mongoose = require("mongoose");

const Rank = new mongoose.Schema({
    name: String,
    access: String
});

module.exports = mongoose.model("Rank", Rank);