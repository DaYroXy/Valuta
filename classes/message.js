const ObjectId = require("mongoose").Types.ObjectId;
const MessageModel = require("../models/Message.model");
const FriendModel = require("../models/Friend.model");

class Message {

    isValid(to, content, image, file) {
        if (!this.user.id || !ObjectId(this.user.id)) {
            console.log("sender not objectId")

            return false;
        }

        if (!to || !ObjectId(to)) {
            console.log("reciever not objectId")
            return false;
        }

        if ((!content && !image) && (!content && !file)) {
            console.log("empty message")
            return false;
        }

        return true;

    }

    async send(to, content, image, file) {
        if (!this.isValid(to, content, image, file)) {
            return {
                status: "error",
                message: "Invalid parameters"
            }
        }

        if (!(await this.returnUserById(to))) {
            return {
                status: "error",
                message: "User not found"
            }
        }

        let messages = await MessageModel.create({
            "from": this.user.id,
            "to": to,
            "content": content,
            "image": image,
            "file": file
        });

        this.message = messages;
    }

    async getRecentMessages() {
        let message = await MessageModel.aggregate(
            [
                {
                    $match: { 
                        $or: [{ from: ObjectId(this.user.id) },
                                { to: ObjectId(this.user.id) }],
                    }
                },
                {
                  '$addFields': {
                    'lookupId': {
                      '$cond': {
                        'if': {
                          '$eq': [
                            '$from', ObjectId(this.user.id)
                          ],
                        }, 
                        'then': '$to', 
                        'else': '$from'
                      }
                    }
                  }
                }
                ,{
                    $lookup: {
                        from: "users",
                        localField: "lookupId",
                        foreignField: "_id",
                        as: "user",
                    }
                },
                {$unwind: "$user"},
                {$project: {
                    _id: 0,
                    "user._id":1,
                    "user.avatar":1,
                    "user.name":1,
                    "user.sockets_id":1 ,
                    "content":1,
                    "createdAt": 1
                }},{
                    $sort: {
                        "createdAt": 1
                    }
                }, {
                    $group: {
                        _id: "$user._id",
                        content: { $last: "$content" },
                        user_id: { $last: "$user._id" },
                        name: { $last: "$user.name" },
                        avatar: { $last: "$user.avatar" },
                        createdAt: { $last: "$createdAt" },
                    }
                }
            ]).sort({createdAt: -1})
        return message;
    }
}

module.exports = Message;