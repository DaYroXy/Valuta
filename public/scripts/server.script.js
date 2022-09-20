

// const URL = "http://localhost:4200/api/v1/"

// const cpu = document.getElementById('totalCores');
// const memory = document.getElementById('totalMemory');
// const storage = document.getElementById('totalStorage');



// fetch(`${URL}/admin/specs`).then(res => res.json()).then(res => {
//     cpu.innerHTML = `${res.Cores} Cores`;
//     memory.innerHTML = `${res.Memory} GB`;
//     storage.innerHTML = `${res.Storage} GB`;
//     console.log(res)
// })


const CPU_USAGE = document.getElementById('cpu-tracker').getContext('2d');
const MEMORY_USAGE = document.getElementById('memory-tracker').getContext('2d');
const STORAGE_USAGE = document.getElementById('storage-tracker').getContext('2d');

//   CPU CHART
const cpuUsage = new Chart(CPU_USAGE, {
type: 'doughnut',
data: {
    labels: [
        'Used',
        'Free',
    ],
    datasets: [{
        label: 'My First Dataset',
        data: [300, 50],
        backgroundColor: [
        '#6B4CE6',
        '#FFFFFF',
        ],
        hoverOffset: 4
    }]
    },
options: {
    plugins: {
        legend: {
            display: false //This will do the task
        }
    },
    rotation: -95,
    cutout: 40
    }
})


// MEMORY CHARt
const memUsage = new Chart(MEMORY_USAGE, {
type: 'doughnut',
data: {
    labels: [
        'Used',
        'Free',
    ],
    datasets: [{
        label: 'My First Dataset',
        data: [300, 50],
        backgroundColor: [
        '#6B4CE6',
        '#FFFFFF',
        ],
        hoverOffset: 4
    }]
    },
options: {
    plugins: {
        legend: {
            display: false //This will do the task
        }
    },
    rotation: -95,
    cutout: 40
    }
})

// STORAGE CHART
const storUsage = new Chart(STORAGE_USAGE, {
type: 'doughnut',
data: {
    labels: [
        'Used',
        'Free',
    ],
    datasets: [{
        label: 'My First Dataset',
        data: [300, 50],
        backgroundColor: [
        '#6B4CE6',
        '#FFFFFF',
        ],
        hoverOffset: 4
    }]
    },
options: {
    plugins: {
        legend: {
            display: false //This will do the task
        }
    },
    rotation: -95,
    cutout: 40
    }
})