const User = require('./user');
const Major = require('./major');
const rankModel = require('../models/Rank.model');

class ServerConf {
    
    async setupSever() {
        new User().resetAllUserStatus();
        new Major().checkIfMajorExists();
        this.setupRanks();
    }

    async setupRanks() {
        let foundRank;
        foundRank = await rankModel.findOne({name: "student"});

        if(!foundRank) {
            let rank = new rankModel({
                name: "student",
                access: 0
            });
            rank.save();
        }

        foundRank = await rankModel.findOne({name: "lecturer"});
        if(!foundRank){
            let rank = new rankModel({
                name: "lecturer",
                access: 1
            });
            rank.save();
        }
        
        foundRank = await rankModel.findOne({name: "admin"});
        if(!foundRank){
            let rank = new rankModel({
                name: "admin",
                access: 2
            });
            rank.save();
        }        
    }

}

module.exports = ServerConf;