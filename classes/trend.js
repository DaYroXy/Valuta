
const TrendModel = require("../models/Trend.model");
const PostModel = require("../models/Post.model");

class Trend {

    getTrendsByText(message) {
        let trends = []

        message.split(" ").forEach(t => {
            (t.startsWith("#")) ? trends.push(t.replace("#", "").toLowerCase()) : null;
        })
            
        return trends;

    }

    async remove() {
        if(!this.id) {
            return;
        }

        let popularity = await TrendModel.findById(this.id); 
        if(popularity.popularity > 1 ){
            let deleted = TrendModel.updateOne({_id: this.id}, {$inc: {popularity: -1}});
            return deleted;
        }

        return TrendModel.deleteOne({_id: this.id});

    }

    async getTrendById(trendId) {
        let trend = await TrendModel.findById(trendId);
        if(trend) {
            this.id = trend.id
        }
        return trend
    }


    async getTrends() {
        return await TrendModel.find({})
    }

    async getTrendsLimitAndSkip(skip, limit) {
        return await TrendModel.find({}).skip(skip).limit(limit).sort({popularity: -1});

    }

    async getTrend(name) {
        name = name.toLowerCase();
        return await TrendModel.findOne({"name": name});
    }

    async addTrend(name) {
        // tolowercase
        name = name.toLowerCase();
        
        if(!name) {
            return {
                "status": "error",
                "message": "cannot add empty trend"
            }
        }

        if(await TrendModel
            .findOneAndUpdate({"name": name }, { $inc:{popularity: 1}})){
            return {
                "status": "success",
                "message": "Trend updated"
            }
            

        }
        if(await TrendModel.create({
            name: name,
            popularity: 1
        })) {
            return {
                "status": "success",
                "message": "Trend added"
            }
        }

        return {
            "status": "error",
            "message": "Trend not added"
        }
    }

    async addTrendToPost(postId, name) {

        let trend = await this.getTrend(name);

        PostModel.findOneAndUpdate({_id: postId}, {$push: { trendId: [ trend._id ]  }}, (err,data) => {
            if(err) {
                return {
                    "status": "error",
                    "message": "Trend not added"
                }
            }
            return {
                "status": "success",
                "message": "Trend added"
            }
        });
    }

}

module.exports = Trend;