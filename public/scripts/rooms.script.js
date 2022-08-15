

function changeRoom(roomId) {
    fetch(`http://localhost:4200/api/v1/rooms/${roomId}`)
    .then(res => res.json())
    .then(data => {
        console.log(data)
    })
}