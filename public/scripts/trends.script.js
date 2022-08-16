let trendsElement = document.getElementById("trends-list")

async function addTrend(trend) {
    if(!trendsElement) {
        
        return;
    }

    html = `<div class="trend">
        <h5><a href="http://valuta-hub.me/?trend=${trend.name}"># ${trend.name}</a></h5>
        <p class="text-muted">${trend.popularity} Posts</p>
    </div>`

    trendsElement.insertAdjacentHTML("beforeend", html);
} 

async function getTrends() {
    let posts = await (await fetch("http://valuta-hub.me/api/v1/trends/?skip=0&limit=5")).json();
    return posts;
}

async function getTrendsAndAddtoDom() {
    getTrends().then(trends => {
        
        if(trends.length == 0) {
            if(!trendsElement) {
                
                return;
            }
            trendsElement.innerHTML = `
                <div class="no-trends">
                    <i class="fa-solid fa-person-hiking"></i>
                    <p>Wow, nothing is trending...</p>
                </div>
            `
            return;
        }
    
        trends.map(trend => {
            addTrend(trend);
        })
    }).catch(err => {
        
    })
}
getTrendsAndAddtoDom()

const escapeRegExpMatch = function(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};
const isExactMatch = (str, match) => {
  return new RegExp(`\\b${escapeRegExpMatch(match)}\\b`).test(str)
}

// Socket Io Conenction
const socket = io("/");


// Listen for new posts from the server
socket.on("newTrend", (trend) => {

    let noTrends = document.querySelector('.no-trends');
    if(noTrends !== null) {
        noTrends.remove();
    }

    let trendsList = document.getElementById('trends-list')
    let isTrendVisible = false;
    let all_trends = trendsList.querySelectorAll(".trend")
    all_trends.forEach(currentTrend => {
        let trendText = currentTrend.querySelector('a')

        if(isExactMatch(trendText.innerText.replace("# ", ""), trend.name)) {

            isTrendVisible = true;
        }  
    })

    if(!isTrendVisible && all_trends.length < 5) {
        addTrend(trend);
    } else {
        trendsElement.innerHTML = "";
        getTrendsAndAddtoDom()

    }
});