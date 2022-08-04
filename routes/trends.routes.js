
const express = require ("express");
const Trend = require("../classes/trend");
const router = express.Router();

router.get("/", async (req,res) => {

    const trend = new Trend();

    if(req.query) {
        const {skip = 0, limit = 5} = req.query;
        res.json( await trend.getTrendsLimitAndSkip(skip, limit));
        return;
    }

    res.json( await trend.getTrends());
})

router.get("/add", async (req,res) => {

    const message = "hello guys how are you today #hello #world #iamgood #sogood";
    // const trend = new TrendClass();
    res.json({
        "messsage" : message
    })
})



module.exports=router;