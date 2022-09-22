
const logsModel = require("../models/Logs.model.js");

class Logs { 
    constructor(ip, browser, method) {
        console.log(method)
        logsModel.create({
            ip: ip,
            browser: browser,
            method: method
        })
    }

}

module.exports = Logs