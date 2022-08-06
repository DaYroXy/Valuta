
const Users = require('../models/User.model');
const Trends = require('../models/Trend.model');


class Search {

    async search(content) {
        content = content.toLowerCase();
        let regExp = new RegExp(`^${content}`);

        let userResults = await this.searchUsers(regExp);
        let trendResults = await this.searchTrends(regExp);

        let Results = userResults.concat(trendResults);

        return Results; 
    }

    async searchUsers(username) {
        let userResults = await Users.find({"username": username }).limit(5);
        return userResults; 
    }

    async searchTrends(trend) {
        let trendResults = await Trends.find({"name": trend }).limit(5);
        return trendResults; 
    }
}


module.exports = Search;