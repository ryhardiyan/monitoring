const socket = io();
let cpuChart, ramChart, diskChart;

function initCharts() {
    const config = {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [0, 100],
                borderWidth: 0
            }]
        },
        options: {
            cutout: '80%',
            responsive: true,
            maintainAspectRatio: false,
            tooltips: { enabled: false },
            hover: { mode: null },
            elements: { arc: { borderWidth: 0 } }
        }
    };

    cpuChart = new Chart(document.getElementById('cpu-chart').getContext('2d'), {
        ...config,
        data: {
            ...config.data,
            datasets: [{...config.data.datasets[0], backgroundColor: ['#3B82F6', '#1F2937']}]
    }});
    cpuChart.originalColor = '#3B82F6';

    ramChart = new Chart(document.getElementById('ram-chart').getContext('2d'), {
        ...config,
        data: {
            ...config.data,
            datasets: [{...config.data.datasets[0], backgroundColor: ['#10B981', '#1F2937']}]
        }
    });
    ramChart.originalColor = '#10B981';

    diskChart = new Chart(document.getElementById('disk-chart').getContext('2d'), {
        ...config,
        data: {
            ...config.data,
            datasets: [{...config.data.datasets[0], backgroundColor: ['#8B5CF6', '#1F2937']}]
        }
    });
    diskChart.originalColor = '#8B5CF6';
}

function updateChart(chart, value) {
    const isOverload = value > 80;
    chart.data.datasets[0].data = [value, 100 - value];
    chart.data.datasets[0].backgroundColor[0] = isOverload ? '#EF4444' : chart.originalColor;
    chart.update();
}

function formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
}

function updateStats(data) {
    const cpuUsage = parseFloat(data.cpu);
    document.getElementById('cpu-usage').textContent = data.cpu;
    document.getElementById('cpu-name').textContent = data.cpu_name;
    document.getElementById('cpu-cores').textContent = data.cpu_cores;
    updateChart(cpuChart, cpuUsage);

    const ramUsage = parseFloat(data.ram);
    document.getElementById('ram-usage').textContent = data.ram;
    document.getElementById('ram-text').textContent = data.ram_text;
    updateChart(ramChart, ramUsage);

    const diskUsage = parseFloat(data.disk.usedPercent);
    document.getElementById('disk-usage').textContent = data.disk.usedPercent;
    document.getElementById('disk-text').textContent = `${data.disk.used} / ${data.disk.total}`;
    updateChart(diskChart, diskUsage);

    document.getElementById('hostname').textContent = data.hostname;
    document.getElementById('platform').textContent = data.platform;
    document.getElementById('architecture').textContent = data.architecture;
    document.getElementById('uptime').textContent = formatUptime(data.uptime);

    document.getElementById('load-1').textContent = data.load_average[0].toFixed(2);
    document.getElementById('load-5').textContent = data.load_average[1].toFixed(2);
    document.getElementById('load-15').textContent = data.load_average[2].toFixed(2);

    // Update network interfaces
    const networkInterfaces = document.getElementById('network-interfaces');
    networkInterfaces.innerHTML = '';
    data.network.forEach(interface => {
        networkInterfaces.innerHTML += `
            <div class="bg-gray-800 p-4 rounded-lg">
                <p class="text-gray-300 font-semibold mb-3">${interface.interface}</p>
                <div class="space-y-2">
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-400">Input:</span>
                        <span class="text-gray-200">${interface.inputBytes}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-400">Output:</span>
                        <span class="text-gray-200">${interface.outputBytes}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-400">Total:</span>
                        <span class="text-gray-200">${interface.totalBytes}</span>
                    </div>
                </div>
            </div>
        `;
    });
    
    document.title = `${data.cpu} CPU | ${data.ram} RAM | ${data.disk.usedPercent} Disk`;
    document.querySelectorAll('.animate-pulse').forEach(el => el.classList.remove('animate-pulse'));
}

socket.on('connect', () => {
    console.log('Connected to server');
    document.querySelectorAll('.animate-pulse').forEach(el => el.classList.remove('animate-pulse'));
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
    document.querySelectorAll('.chart-container, span, p').forEach(el => el.classList.add('animate-pulse'));
});

socket.on('stats', (data) => {
    updateStats(data);
});

document.addEventListener('DOMContentLoaded', function() {
    initCharts();
});
