

let logoutButton = document.getElementById("logout");

logoutButton.addEventListener("click", async (e) => {
    e.preventDefault();

    await fetch("https://valuta-hub.me/api/v1/entry/logout", {
        method: "PUT",
    })

    window.location.href = "https://valuta-hub.me/entry";
})