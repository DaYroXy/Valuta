
const postModel = require('../models/Post.model');
const userModel = require('../models/User.model');
const User = require('../classes/user.js');


class Post {
    
    async postData({content, image, file}) {
        this.content = content;
        this.image = image;
        this.file = file;
    }

    async isValid() {

        // if content is empty
        if(!this.user || this.user === undefined) {
            return {
                status: "error",
                message: "User not found"
            }
        }

        if(this.content === "" || this.content === undefined) {
            return {
                status: "error",
                message: "Content is empty"
            }
        }

        return {
            status: "success",
            message: "Data is valid"
        }
    }
    
    async setUserById(userId) {
        let user = await new User().getUserById(userId);
        this.user = user;
        return user;
    }

    // Post to DB
    async post() {
        if((await this.isValid()).status !== "success") {
            return {
                status: "error",
                message: "Data is not valid"
            };
        }

        let post = await postModel.create({
            userId: this.user._id,
            content: this.content,
            image: this.image,
            file: this.file,
        });

        if(!post) {
            return {
                status: "error",
                message: "Post not created"
            }
        }

        return {
            status: "sucess",
            message: "Post created",
            data : post
        }

    }

    async getPosts() {
        let posts = await postModel.aggregate([
            { $lookup:
                { 
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user"
                }
            }, { 
                $unwind: "$user"
            }, { 
                $project: { 
                    "user._id":1,
                    "user.name":1,
                    "user.avatar":1,
                    "user.username":1,
                    "user.rank":1,
                    id:1,
                    content:1,
                    image:1,
                    file:1,
                    createdAt: 1
                }
            }]).sort({createdAt: 1}).limit(10)
        return posts;
    }

    async getUserPosts() {
        let userId = await this.getUser();
        if(!userId) {
            return {
                status: "error",
                message: "User not found"
            }
        }
        userId = userId.id
        console.log(userId)
        let posts = await postModel.aggregate([
            {
                $match: { "userId": userId}
            },
            { $lookup:
                { 
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user"
                }
            }, { 
                $unwind: "$user"
            }, { 
                $project: { 
                    "user._id":1,
                    "user.name":1,
                    "user.avatar":1,
                    "user.username":1,
                    "user.rank":1,
                    id:1,
                    content:1,
                    image:1,
                    file:1,
                    createdAt: 1
                }
            }]).sort({createdAt: 1}).limit(10)

        return posts;

    }
}

module.exports = Post