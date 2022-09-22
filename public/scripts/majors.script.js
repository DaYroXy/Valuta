let selectedMajor = document.getElementById('selected-major')

selectedMajor.addEventListener('change', function () {
    console.log(selectedMajor.value)
})

const Data = [
    {
        label: 'Software Developer',
        data: [0, 20, 20, 60, 60, 120],
        fill: false,
        cubicInterpolationMode: 'monotone',
        tension: 0.4,
        borderColor: "#ff6384"
    },
    {
        label: 'Biotechnoalligy',
        data: [0, 4, 12, 40, 80, 104],
        fill: false,
        cubicInterpolationMode: 'monotone',
        tension: 0.4,
        borderColor: "#6B4CE6"
    },
]
// const datapoints = [0, 20, 20, 60, 60, 120, NaN, 180, 120, 125, 105, 110, 170];

const ctx = document.getElementById('myChart').getContext('2d');
const myChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['6 Hours ago', '5 Hours ago', '4 Hours ago', '3 Hours ago', '2 Hours ago', '1 Hour ago'],
        datasets: Data
    },
    options: {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: 'Most Popular Majors'
            },
        },
        interaction: {
            intersect: false,
        },
        scales: {
            x: {
                display: true,
                title: {
                    display: true
                }
            },
            y: {
                display: true,
                title: {
                    display: true,
                    text: 'Value'
                },
                suggestedMin: -10,
                suggestedMax: 200
            }
        }
    }
});

function getMajorsUpdate() {
    let selectedMajor = document.getElementById('selected-major')
    fetch(`http://localhost:4200/api/v1/admin/majors`)
    .then(res => res.json())
    .then(majors => {
        majors.map(m => {
            selectedMajor.insertAdjacentHTML("afterbegin", `<option value="${m.name}">${m.name}</option>`)
        })
    })
}

getMajorsUpdate()

const addMajorButton = document.querySelector("#add-major-button");
const majorHandler = document.querySelector("#major-handler");
addMajorButton.addEventListener('click', (e) => {
    console.log("got here")
    e.preventDefault();
    let name = document.querySelector("#major-name");
    let years = document.querySelector("#major-years");
    let lecturers = []

    let major = {
        name: name.value,
        years: years.value,
        lecturers: lecturers
    }

    fetch("http://localhost:4200/api/v1/admin/majors/add",{
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(major)
    }).then(res => res.json()).then(res => {
        if(res.status === "success") {
            name.value = "";
            years.value = "";
            majorHandler.style = "color:var(--color-online); margin-top:1rem;"
        } else {
            majorHandler.style = "color:var(--color-danger); margin-top:1rem;"   
        }
        majorHandler.textContent = res.message
        console.log(res)
    })

})


const lecturer_username = document.querySelector("#lecturer-username");

const addLecturerButton = document.querySelector("#add-lecturer-button");

addLecturerButton.addEventListener("click", () => {
    let major = document.querySelector("#selected-major");
    let username = lecturer_username.value;
    let lecturer = {
        username: username,
        major: major.value
    }
    fetch("http://localhost:4200/api/v1/admin/lecturer/add",{
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(lecturer)
    }).then(res => res.json()).then(res => {
        if(res.status === "success") {
            lecturer_username.value = "";
            lecturerHandler.style = "color:var(--color-online); margin-top:1rem;"
        } else {
            lecturerHandler.style = "color:var(--color-danger); margin-top:1rem;"   
        }
        lecturerHandler.textContent = res.message
    })
})

const removeLecturerButton = document.querySelector("#remove-lecturer-button");
const  lecturerHandler = document.querySelector("#lecturer-handler")
removeLecturerButton.addEventListener("click", () =>{
    let major = document.querySelector("#selected-major");
    let username = lecturer_username.value;
    let lecturer = {
        username: username,
        major: major.value
    }
    fetch("http://localhost:4200/api/v1/admin/lecturer/remove",{
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(lecturer)
    }).then(res => res.json()).then(res => {
        if(res.status === "success") {
            lecturer_username.value = "";
            lecturerHandler.style = "color:var(--color-online); margin-top:1rem;"
        } else {
            lecturerHandler.style = "color:var(--color-danger); margin-top:1rem;"   
        }
        lecturerHandler.textContent = res.message
    })
})