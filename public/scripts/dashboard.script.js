// user-disconnected

const API_URL = "http://localhost:4200/api/v1/";

// text variables
const TOTAL_USERS_TEXT = document.getElementById("total-users")
const TOTAL_LECTURERS_TEXT = document.getElementById("total-lecturers")
const TOTAL_ADMINS_TEXT = document.getElementById("total-admins")

// online status variables
const TOTAL_USERS_TEXT_ONLINE = document.getElementById("total-users-online")
const TOTAL_LECTURERS_TEXT_ONLINE = document.getElementById("total-lecturers-online")
const TOTAL_ADMINS_TEXT_ONLINE = document.getElementById("total-admins-online")

// api count grabber
async function getTotalUsers() {
    return (await fetch(`${API_URL}/admin/list/users`)).json()
}

async function getTotalLecturers() {
    return (await fetch(`${API_URL}/admin/list/lecturers`)).json()
}

async function getTotalAdmins() {
    return (await fetch(`${API_URL}/admin/list/admins`)).json()
}

// documents update
async function updateAll() {
    let users = await getTotalUsers()
    let lecturers = await getTotalLecturers()
    let admins = await getTotalAdmins()

    TOTAL_USERS_TEXT.innerHTML = `${users.total} Users`
    TOTAL_LECTURERS_TEXT.innerHTML = `${lecturers.total} Lecturers`
    TOTAL_ADMINS_TEXT.innerHTML = `${admins.total} Admins`

    TOTAL_USERS_TEXT_ONLINE.innerHTML = `${users.online} Online`
    TOTAL_LECTURERS_TEXT_ONLINE.innerHTML = `${lecturers.online} Online`
    TOTAL_ADMINS_TEXT_ONLINE.innerHTML = `${admins.online} Online`
}

updateAll();
