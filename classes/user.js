let ObjectId = require('mongoose').Types.ObjectId;
const User = require("../models/User.model");
const postModel = require("../models/Post.model");
const rankModel = require("../models/Rank.model");

const bcrypt = require("bcrypt");
const { default: mongoose } = require('mongoose');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));


class user {

    // Set user by username or id
    async setUser(usernameId) {
        
        let user;
        if(!ObjectId.isValid(usernameId)) {
            user = await User.findOne({username:usernameId}, {"password":0, "email":0});
        }else{           
            user = await User.findById(usernameId, {"password":0, "email":0});
        }

        if(!user) {
            return {
                status: "error",
                message: "User not found"
            }
        }

        user = user.toObject()

        user.friends_count = 0,
        user.posts_count= 0
        this.user = user;
        return user;
    }
    
    // check if user exists
    async userExists(username) {
        let user = await User.findOne({$or:[{'email':username},{'username':username}]});
        return user;
    }

    // get user data
    getUser() {
        return this.user;
    }
    
    // get user rank
    async getUserRank() {
        return await rankModel.findOne({id: this.user.rank});
    }

    // get user by id
    async findUserById(userId) {
        if(!ObjectId.isValid(userId)) {
            return {
                status: "error",
                message: "Invalid user id"
            }
        }

        let user = await User.findById(userId);
        return user;
    }

    // find user by useranme
    async findUserByUseranme(username) {
        let user = await User.findOne({username: username}, {"sockets_id":0, "password":0, "email":0});
        if(!user) {
            return;
        }
        return user
    }
    
    // find user by id
    async findUserById(userId) {
        if(!ObjectId.isValid(userId)) {
            return {
                status: "error",
                message: "Invalid user id"
            }
        }

        let user = await User.findById(userId);
        return user;
    }

    // get user sockets
    async getUserSockets() {
        if(!this.user) {
            return({
                status: "error",
                message: "User not found"
            })
        }

        return (await User.findById(this.user._id, {_id:0, sockets_id: 1})).sockets_id;
    }

    // add socket to user
    async addSocket(socket_id) {
        await User.updateOne({ _id: this.user._id}, {$push: {sockets_id: [ socket_id ] }})
        return true;
    }

    // remove socket from user
    async removeSocket(socket_id) {
        await User.updateOne({ _id: this.user._id}, { $pull: {sockets_id: socket_id }})
        return true;
    }


    // register user
    async register({name, username, password, email, bio, socket_id}) {
        if(await this.userExists(username)) {
            return {
                status: "error",
                message: "Username is already taken"
            };
        }
        
        const hashedPassword = await bcrypt.hash(password, 10)

        var backgroundImage;
        try  {
            const Url = await fetch("https://picsum.photos/800")   
            backgroundImage = Url.url
    
        } catch(err) {
            backgroundImage = "anas-bg.jpeg"
        }

        var userImage;
        try  {
            let rngBGcolor = (Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0');
            let seed = Math.round(Math.random()*Math.pow(2,64)).toString(36)
            const Url = await fetch(`https://avatars.dicebear.com/api/bottts/${seed}.png?background=%23${rngBGcolor}`)   
            
            userImage = Url.url
    
        } catch(err) {
            userImage = "anas.jpeg"
        }

        let rank = await rankModel.findOne({access: 0});
        if(!rank) {
            rank = await rankModel.create({
                name: "student",
                access: 0})
        }
        

        await User.create({
            avatar: userImage,
            bg_image: backgroundImage,
            name: name,
            username: username,
            password: hashedPassword,
            email: email,
            rank: rank._id,
            bio: bio,
            sockets_id: socket_id
        })
        this.user = await this.userExists(username);
        return {
            "status": "success",
            "message": "Account created successfully"
        };
    }

    // Login User
    async login(username, password) {
        let user = await this.userExists(username);
        if(!user) {
            return false;
        }

        if(bcrypt.compare(password, user.password)) {
            this.user = user;
            return true;
        } else {
            return false;
        }
    }

    // Logout user
    async logout() {
        if(!this.user) {
            return({
                status: "error",
                message: "User not found"
            })
        }
        await User.updateOne({_id: this.user._id}, {$set: {sockets_id: []}});
        return true;
    }

    async Posts() {
        if(!this.user) {
            return({
                status: "error",
                message: "User not found"
            })
        }
    
        const posts = await postModel.aggregate([
            {
                $match: {
                    "userId" : mongoose.Types.ObjectId(this.user.id)
                }
            },
            {
                "$lookup": {
                  "from": "users",
                  "localField": "userId",
                  "foreignField": "_id",
                  "as": "user"
                }
              },
              {
                "$unwind": "$user"
              },
              {
                "$lookup": {
                    "from": "ranks",
                    "localField": "user.rank",
                    "foreignField": "_id",
                    "as": "rank"
                }
              },
              {
                "$unwind": "$rank"      
              },
              {"$project": {
                "_id":1,
                "content":1,
                "image":1,
                "file":1,
                "createdAt": 1,
                "user.name": 1,
                "user.avatar": 1,
                "user.username": 1,
                "rank.name" : 1, 
            }}
            
          ]).sort({"createdAt":1}).limit(10);
        return posts;
    }

    // Reset all users status on server startup
    async resetAllUserStatus() {
        await User.updateMany({}, {$set: {sockets_id: []}});
        return true;
    }


    // Get User Posts Count
    async getUserPostsCount() {
        if(!this.user) {
            return({
                status: "error",
                message: "User not found"
            })
        }
        let posts = await postModel.find({userId: this.user._id});
        return posts.length;
    }

    

}

module.exports = user;