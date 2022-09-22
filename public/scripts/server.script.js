const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Get Logs
const Logs_Element = document.querySelector(".recent-users tbody")
fetch("http://localhost:4200/api/v1/admin/logs").then(res => res.json())
.then(res => {
    let index = res.count
    res.data.forEach(log => {
        const tr = document.createElement("tr")
        let date = new Date(log.createdAt).toLocaleString()
        tr.innerHTML = `
            <td>${index}</td>
            <td>${date}</td>
            <td>${log.ip}</td>
            <td>${log.browser}</td>
            <td>/${log.method}</td>
        `
        index--;
        Logs_Element.appendChild(tr)
    })
})



// canvas for chart
const CPU_USAGE = document.getElementById('cpu-tracker').getContext('2d');
const MEMORY_USAGE = document.getElementById('memory-tracker').getContext('2d');
const STORAGE_USAGE = document.getElementById('storage-tracker').getContext('2d');

// middle text for chart
const CORE_TEXT_USAGE = document.getElementById('coresUsage');
const MEMORY_TEXT_USAGE = document.getElementById('memoryUsage');
const STORAGE_TEXT_USAGE = document.getElementById('storageUsage');

// update chart
function updateChart(element, data) {
    element.data.datasets[0].data = [data, 100-data]
    element.update();
}

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
            data: [USAGES_CHAR_HOLDER.cpu, USAGES_CHAR_HOLDER.cpu-100],
            backgroundColor: [
                '#6B4CE6',
                '#808080',
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
            data: [USAGES_CHAR_HOLDER.memory, USAGES_CHAR_HOLDER.memory-100],
            backgroundColor: [
            '#6B4CE6',
            '#808080',
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
        data: [USAGES_CHAR_HOLDER.storage, USAGES_CHAR_HOLDER.storage-100],
        backgroundColor: [
        '#6B4CE6',
        '#808080',
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

socket.on("os-usages", (result) => {
    CORE_TEXT_USAGE.innerText = result.CPU.usage + "%";
    MEMORY_TEXT_USAGE.innerText = result.Memory.percentage + "%";
    STORAGE_TEXT_USAGE.innerText = result.Storage.percentage + "%";
    updateChart(cpuUsage, result.CPU.usage);
    updateChart(memUsage, result.Memory.percentage);
    updateChart(storUsage, result.Storage.percentage);
})