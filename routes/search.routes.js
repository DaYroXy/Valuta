const express = require ("express");
const router = express.Router();

const Search = require("../classes/search");


router.get("/:all", async (req, res) => {

    const {all} = req.params;

    let search = new Search();
    console.log(all)
    let results = (await search.search(all))
    res.json(results)

})

module.exports=router;
