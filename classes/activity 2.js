const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId
const activityModel = require("../models/Activity.model");

class Activity {

    constructor(userId, status) {
        activityModel.create({
            userId: ObjectId(userId),
            message: this.statusSelect(status),
            status: status
        })
    }

    statusSelect(status) {
        if(status === 1) {
            return "Just submitted a new post.";
        }

        if(status === 2) {
            return "Just deleted a post.";
        }

        if(status === 3) {
            return "Just added a new friend.";
        }

        if(status === 4) {
            return "Just accepted a friend.";
        }

        if(status === 5) {
            return "Just removed a friend.";
        }
    }
}

module.exports = Activity;
