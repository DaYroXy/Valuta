

let searchElement = document.querySelector("#friends-search");
if(searchElement){
    
    let searchResults = document.querySelector(".search-results");
    searchResults.style.display = "none"
    searchElement.addEventListener("input", (e) => {
        searchResults.style.display = "block"
        searchResults.innerHTML = ""
        console.log("YES")
    })

    searchElement.addEventListener("focusout", (e) => {
        searchResults.style.display = "none"
        console.log("YES")
    })

}

