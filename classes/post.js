const mongoose = require("mongoose");
const postModel = require('../models/Post.model');
const userModel = require('../models/User.model');
const User = require('../classes/user.js');


class Post {
    
    async postData({content, image, file}) {
        this.content = content;
        this.image = image;
        this.file = file;
    }

    async getPostById(postid) {
        const post = await postModel.findById(postid);
        
        if(post) {
            this.id = post._id;
        }
        
        return post;
    }

    async delete() {
        if(!this.id) {
            return {
                status: "error",
                message: "Post id is empty"
            }
        }
        return await postModel.deleteOne({_id:this.id});

    }

    async isValid() {

        // if content is empty
        if(!this.user || this.user === undefined) {
            return {
                status: "error",
                message: "User not found"
            }
        }

        if((this.content === "" || this.content === undefined) && !this.image) {
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

    async addTrendId(trendId) {
        let post = await postModel.find({"id": this.id})
        return post;
    }

    async getPosts() {
        const posts = await postModel.aggregate([
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
            {
            "$project": 
                {
                    "_id":1,
                    "content":1,
                    "image":1,
                    "file":1,
                    "createdAt": 1,
                    "user.name": 1,
                    "user.avatar": 1,
                    "user.username": 1,
                    "rank.name" : 1, 
                }
            }
            
          ]).sort({"createdAt":-1}).limit(10);
        return posts;
    }

    async getPostsByTrend(trendName) {
        const posts = await postModel.aggregate([
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
            {
                $lookup: {
                    from: "trends",
                    localField: "trendId",
                    foreignField: "_id",
                    pipeline: [
                        {
                            $match: {"name": trendName}
                        }
                    ],
                    as: "trend"
                }   
            },
            {
                $unwind: "$trend"
            },
            {
                "$project": 
                {
                    "_id":1,
                    "content":1,
                    "image":1,
                    "file":1,
                    "createdAt": 1,
                    "user.name": 1,
                    "user.avatar": 1,
                    "user.username": 1,
                    "rank.name" : 1, 
                }
            }
        ]).sort({"createdAt":1}).limit(10)

        if(!posts) {
            return {
                status: "error",
                message: "Posts not found"
            }
        }

        return posts;
    }

}

module.exports = Post