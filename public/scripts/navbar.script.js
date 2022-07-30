

let logoutButton = document.getElementById("logout");

logoutButton.addEventListener("click", async (e) => {
    e.preventDefault();

    fetch("http://localhost:4200/api/v1/logout", {
        method: "POST",
    })

    window.location.href = "http://localhost:4200/entry";
})