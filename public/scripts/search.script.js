function isEmptyOrSpaces(str){
    return str === null || str.match(/^ *$/) !== null;
}

const getSearchResults = throttleSearch(async text => {

    let API_URL = `https://valuta-hub.me/api/v1/search/${text}`
    if(text.startsWith('#')) {
        text = text.replaceAll("#", "")
        API_URL = `https://valuta-hub.me/api/v1/search/trends/${text}`
    }

    console.log(text)
    if(isEmptyOrSpaces(text)) {
        return;
    }
    
    fetch(API_URL).then(res => res.json())
    .then(res => {
        let searchResultsElement = document.querySelector(".search-results > ul");
        if(searchResultsElement.parentElement.style.display === "none") {
            searchResultsElement.parentElement.style.display = "block";
        }

        searchResultsElement.innerHTML = ""
        if(res.length === 0 ) {
            searchResultsElement.innerHTML = "<li>No results found</li>"
        }

        res.forEach(result => {
            let html = ""
            if("username" in result) {
                let avatar = ""
                if(result.avatar.includes("http") || result.avatar.includes("https")) {
                    avatar = `<img src="${result.avatar}" alt="user profile picture">`;
                } else {
                    avatar = `<img src="https://valuta-hub.me/uploads/${result.avatar}" alt="user profile picture">`;
                }
                html = `
                <a href="https://valuta-hub.me/profile/${result.username}">
                    <div class="search-result-user">
                        <div class="profile-picture">
                            ${avatar}
                        </div>

                        <div class="user-info">
                            <h5 class="handle">${result.name}</h5>
                            <p class="text-muted">@${result.username}</p>
                        </div>

                    </div>
                </a>
                    `
            } else {
                html = `
                <a href="https://valuta-hub.me/?trend=${result.name}">
                    <div class="search-trend-result">
                        <h5>#${result.name}</h5>
                        <p class="text-muted">${result.popularity} posts</p>
                    </div>
                </a>`
            }

            searchResultsElement.insertAdjacentHTML("beforeend", html);
        })


    })

}, 1000)

function throttleSearch(cb, delay) {
    let shouldWait = false;
    let waitingArgs;
    const timeoutFunc = () => {
        if(waitingArgs == null) {
            shouldWait = false;
        } else {
            cb(...waitingArgs)
            waitingArgs = null;
            setTimeout(timeoutFunc, delay);
        }
    }

    return (...args) => {
        if(shouldWait) {
            waitingArgs = args;
            return;
        }

        cb(...args);
        shouldWait = true;

        setTimeout(timeoutFunc, delay);
    }
}

document.querySelector(".search-results").style.display = "none"
let searchElement = document.querySelector("#friends-search");
if(searchElement){

    searchElement.addEventListener("input", async (e) => {
        getSearchResults(e.target.value);
    })

    let isReady = true;
    searchElement.addEventListener("focusout", (e) => {
        if(!isReady) {
            return;
        }
        isReady = false;
        setTimeout(() => {
            document.querySelector(".search-results").style.display = "none"
            document.querySelector(".search-results > ul").innerHTML = ""
            isReady = true;
        },100)
    })

}


let friends_list_element = document.getElementById("friends-list-search");
if(friends_list_element){


    friends_list_element.addEventListener("keyup", (e) => {
        let friends_list_container = document.querySelectorAll(".friend");

        let Found = []
        friends_list_container.forEach(friend => {
            const friendName = friend.querySelector("h5").textContent
            if(friendName.toLowerCase().startsWith(e.target.value.toLowerCase())) {
                Found.push(friend)
                friend.style.display = ""
            } else {
                friend.style.display = "none"
            }
        })

        let NoResults = document.querySelector(".no-results-found")
        if(Found.length === 0 && !NoResults) {
            let NoResults = `
                <div class="no-results-found">
                    <h5>No results found.</h5>
                </div>
            `

            document.querySelector(".friends-list").insertAdjacentHTML("beforeend", NoResults)
        }

        if(Found.length > 0 && NoResults) {
            NoResults.remove();
        }

    })

}



// room search 
let room_list_element = document.getElementById("rooms-search")
if(room_list_element){


    room_list_element.addEventListener("keyup", (e) => {
        let rooms_list_container = document.querySelectorAll("#room-menu-select");

        let Found = []
        rooms_list_container.forEach(room => {
            const friendName = room.querySelector("h5").textContent
            if(friendName.toLowerCase().startsWith(e.target.value.toLowerCase())) {
                Found.push(room)
                room.style.display = ""
            } else {
                room.style.display = "none"
            }
        })

        let NoResults = document.querySelector(".no-results-found")
        if(Found.length === 0 && !NoResults) {
            let NoResults = `
                <div class="no-results-found">
                    <h5>No results found.</h5>
                </div>
            `

            document.querySelector(".messages-container").insertAdjacentHTML("beforeend", NoResults)
        }

        if(Found.length > 0 && NoResults) {
            NoResults.remove();
        }

    })

}
