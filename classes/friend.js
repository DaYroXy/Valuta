const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId
const friendModel = require("../models/Friend.model");

class Friend {


    async friendStatus(username) {
        let friend = await this.returnUserByUsername(username);
        if(!friend) {
            return {
                status: "error",
                message: "User not found"
            }
        }
        
        let isFriend = await friendModel.findOne({
            $or: [{
                    $and: [{requester: friend._id}, {recipient: this.user._id}, {status: 1}]
                },
                {
                    $and: [{requester: this.user._id}, {recipient: friend._id}, {status: 1}]
                }
            ],
        });

        if(isFriend) {
            return {
                status: "success",
                message: "You are friends with this user"
            }
        }

        let isRequested = await friendModel.findOne({
            $and: [{requester: this.user._id}, {recipient: friend._id}, {status: 0}]
        });

        if(isRequested) {
            return {
                status: "pending",
                message: "You have already sent a friend request"
            }
        }

        let isReadyToAccept = await friendModel.findOne({
            $and: [{requester: friend._id}, {recipient: this.user._id}, {status: 0}]
        });

        if(isReadyToAccept) {
            return {
                status: "accept",
                message: "You have a friend request from this user"
            }
        }

        return {
            status: "error",
            message: "You are not friends with this user"
        }    
    }


    async addFriend(username) {

        let friend = await this.returnUserByUsername(username);
        if(!friend) {
            return {
                status: "error",
                message: "User not found"
            }

        }

        if(this.user.username===username) {
            return {
                status: "error",
                message: "You can't add yourself as a friend"
            }
        }

        let isAlreadyFriends = await friendModel.findOne({
                $or: [{
                        $and: [{requester: friend._id}, {recipient: this.user._id}, {status: 1}]
                    },
                    {
                        $and: [{requester: this.user._id}, {recipient: friend._id}, {status: 1}]
                    }
                ],
        });

        if(isAlreadyFriends) {
            return {
                status: "error",
                message: "You are already friends with this user"
            }
        }


        let isFriendAlreadySentRequest = await friendModel.findOne({
            requester: friend.id,
            recipient: this.user.id,
            status: 0
        })

        if(isFriendAlreadySentRequest) {
            if(await friendModel.updateOne({"_id":isFriendAlreadySentRequest.id}, { $set : {status: 1}})) {
                return {
                    status: "success",
                    message: "Friend request accepted"
                }
            }
        }

        let isRequested = await friendModel.findOne({
            requester: this.user.id,
            recipient: friend.id,
            status: 0
        })

        if(isRequested) {
            return {
                status: "error",
                message: "You have already sent a friend request"
            }
        }

        if(await friendModel.create({
            requester: this.user.id,
            recipient: friend.id,
            status: 0
        })) {
            return {
                status: "success",
                message: "Friend request sent"
            }
        }
    }

    async getFriendsCount() {
        let friends = await friendModel.find({
            $or: [{
                    $and: [{requester: this.user._id}, {status: 1}]
                },
                {
                    $and: [{recipient: this.user._id}, {status: 1}]
                }
            ],
        });
        return friends.length;
    }
    
    async remove(username) {
        let friend = await this.returnUserByUsername(username);
        if(!friend) {
            return {
                status: "error",
                message: "User not found"
            }
        }

        let isFriend = await friendModel.findOne({
            $or: [{
                    $and: [{requester: friend._id}, {recipient: this.user._id}]
                },
                {
                    $and: [{requester: this.user._id}, {recipient: friend._id}]
                }
            ],
        });

        if(!isFriend) {
            return {
                status: "error",
                message: "You are not friends with this user"
            }
        }

        if(await friendModel.deleteOne({"_id":isFriend.id})) {
            return {
                status: "success",
                message: "Friend removed"
            }
        }
    }

    async getFriends() {
        let friends = await friendModel.aggregate([
            {$match: {
                "recipient" : ObjectId(this.user.id)
            }},
            {
                $lookup: {
                    from: "users",
                    localField: "requester",
                    foreignField: "_id",
                    as: "user",
    
                }
            }, {$unwind: "$user"},
            {$project: {
                "user._id":1,
                "user.avatar":1,
                "user.name":1,
                "user.sockets_id":1  
            }}
        ]);

        let friends2 = await friendModel.aggregate([
            {$match: {
                "requester" : ObjectId(this.user.id)
            }},
            {
                $lookup: {
                    from: "users",
                    localField: "recipient",
                    foreignField: "_id",
                    as: "user",
    
                }
            }, {$unwind: "$user"},
            {$project: {
                "user._id":1,
                "user.avatar":1,
                "user.name":1,
                "user.sockets_id":1  
            }}
        ]);
        let result = friends.concat(friends2)
        // Sort by array length
        result.sort((a, b) => {
            return b.user.sockets_id.length - a.user.sockets_id.length
        });
        return result;
    }
}

module.exports = Friend;