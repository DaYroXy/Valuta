

let logoutButton = document.getElementById("logout");

logoutButton.addEventListener("click", async (e) => {
    e.preventDefault();

    await fetch("http://localhost:4200/api/v1/entry/logout", {
        method: "PUT",
    })

    window.location.href = "http://localhost:4200/entry";
})