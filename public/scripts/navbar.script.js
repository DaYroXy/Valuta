

let logoutButton = document.getElementById("logout");

logoutButton.addEventListener("click", async (e) => {
    e.preventDefault();

    fetch("/api/v1/entry/logout", {
        method: "POST",
    })

    window.location.href = "http://localhost:4200/entry";
})