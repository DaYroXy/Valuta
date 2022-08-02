let ObjectId = require('mongoose').Types.ObjectId;
const User = require("../models/User.model");
const userModel = require("../models/User.model");
const bcrypt = require("bcrypt");
const { default: mongoose } = require('mongoose');

class user {

    getUser() {
        const user = {
            id: this.user._id,
            avatar: this.user.avatar,
            bg_image: this.user.bg_image,
            name: this.user.name,
            username: this.user.username,
            email: this.user.email,
            rank: this.user.rank,
            bio: this.user.bio,
            sockets_id: this.user.sockets_id,
            friends_count: 0,
            posts_count: 0
        }
        return user;
    }

    async getUserByUsername(username) {
        let user = await User.findOne({username: username}, {"sockets_id":0, "password":0, "email":0});
        if(!user) {
            return {
                status: "error",
                message: "User not found"
            }
        }
        
        return user;
    }

    async userExists(username) {
        let user = await User.findOne({$or:[{'email':username},{'username':username}]});

        this.user = user;
        return user;
    }

    async getUserById(userId) {
        if(!ObjectId.isValid(userId)) {
            return {
                status: "error",
                message: "Invalid user id"
            }
        }
        let user = await User.findById(userId);
        this.user = user;
        return user;
    }


    async addSocket(socket_id) {
        await User.updateOne({ _id: this.user._id}, {$push: {sockets_id: [ socket_id ] }})
        this.user = user;
        return true;
    }

    async removeSocket(socket_id) {
        await User.updateOne({ _id: this.user._id}, { $pull: {sockets_id: socket_id }})
        this.user = user;
        return true;
    }

    async register({name, username, password, email, bio, socket_id}) {
        if(await this.userExists(username)) {
            return {
                status: "error",
                message: "Username is already taken"
            };
        }
        
        const hashedPassword = await bcrypt.hash(password, 10)
        
        await User.create({
            avatar: "anas.jpeg",
            bg_image: "anas-bg.jpeg",
            name: name,
            username: username,
            password: hashedPassword,
            email: email,
            rank: 0,
            bio: bio,
            sockets_id: socket_id
        })
        this.user = await this.userExists(username);
        return {
            "status": "success",
            "message": "Account created successfully"
        };
    }

    async login(username, password) {
        let user = await this.userExists(username);
        if(!user) {
            return false;
        }

        if(await bcrypt.compare(password, user.password)) {
            this.user = user;
            return true;
        } else {
            return false;
        }
    }

    async logout(username) {
        let user = await this.userExists(username);
        if(!user) {
            return false;
        }

        user.sockets_id = [];
        await user.save();
        return true;
    }

    async Posts() {
        if(!this.user) {
            return({
                status: "error",
                message: "User not found"
            })
        }
    
        const posts = await userModel.aggregate([
            {
                $match: {
                    "_id" : mongoose.Types.ObjectId(this.user.id)
                }
            },
            {
              "$lookup": {
                "from": "posts",
                "localField": "_id",
                "foreignField": "userId",
                "as": "post"
              }
            },
            {"$unwind": "$post"},
            {"$project": {
                "_id":1,
                "name": 1,
                "avatar": 1,
                "username": 1,
                "rank" : 1, 
                "post._id": 1,
                "post.content": 1,
                "post.image": 1,
                "post.file": 1,
                "post.createdAt": 1,
            }}
          ]).sort({"post.createdAt":1}).limit(10);
        return posts;
    }
    
}

module.exports = user;