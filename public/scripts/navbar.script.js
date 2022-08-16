

let logoutButton = document.getElementById("logout");

logoutButton.addEventListener("click", async (e) => {
    e.preventDefault();

    await fetch("http://valuta-hub.me/api/v1/entry/logout", {
        method: "PUT",
    })

    window.location.href = "http://valuta-hub.me/entry";
})