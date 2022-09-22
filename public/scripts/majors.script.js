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