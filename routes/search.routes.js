const express = require ("express");
const router = express.Router();

const Search = require("../classes/search");


router.get("/:all", async (req, res) => {

    const {all} = req.params;

    let search = new Search();
    let results = (await search.search(all))
    res.json(results)

})

router.get("/trends/:trendName", async (req, res) => {
    const {trendName} = req.params;

    let search = new Search();

    trend = trendName.toLowerCase();
    let regExp = new RegExp(`^${trendName}`);

    let results = (await search.searchTrends(regExp))
    res.json(results)
})

module.exports=router;
