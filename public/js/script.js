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

        function updateTemperature(temp) {
            const temperatureElement = document.getElementById('temperature');
            const tempStatusElement = document.getElementById('temp-status');
            
            if (temp === null) {
                temperatureElement.textContent = 'N/A';
                tempStatusElement.textContent = 'Temperature not available';
                return;
            }
            
            temperatureElement.textContent = temp;
            
            // Optional: Change status text based on temperature value
            // Extract the numeric value from the temperature string (e.g. "45.2°C" -> 45.2)
            const numericTemp = parseFloat(temp);
            if (!isNaN(numericTemp)) {
                if (numericTemp < 40) {
                    tempStatusElement.textContent = 'Normal';
                    temperatureElement.classList.remove('text-yellow-400', 'text-red-500');
                    temperatureElement.classList.add('text-green-400');
                } else if (numericTemp < 70) {
                    tempStatusElement.textContent = 'Moderate';
                    temperatureElement.classList.remove('text-green-400', 'text-red-500');
                    temperatureElement.classList.add('text-yellow-400');
                } else {
                    tempStatusElement.textContent = 'High';
                    temperatureElement.classList.remove('text-green-400', 'text-yellow-400');
                    temperatureElement.classList.add('text-red-500');
                }
            }
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
            document.getElementById('uptime-small').textContent = `Uptime: ${formatUptime(data.uptime)}`;

            document.getElementById('load-1').textContent = data.load_average[0].toFixed(2);
            document.getElementById('load-5').textContent = data.load_average[1].toFixed(2);
            document.getElementById('load-15').textContent = data.load_average[2].toFixed(2);

            // Update network interfaces
            const networkInterfaces = document.getElementById('network-interfaces');
            networkInterfaces.innerHTML = '';
            data.network.forEach(interface => {
                networkInterfaces.innerHTML += `
                    <div class="bg-gray-800 p-4 rounded-lg hover:bg-gray-750 transition-all duration-300">
                        <div class="flex justify-between items-center mb-3">
                            <p class="text-gray-300 font-semibold">${interface.interface}</p>
                            <div class="status-pill bg-indigo-900 text-indigo-300 text-xs">Active</div>
                        </div>
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
            document.getElementById('connection-status').textContent = 'Connected';
            document.querySelector('.status-indicator').classList.remove("indicator-yellow");
            document.querySelector('.status-indicator').classList.add('indicator-green');
            document.querySelector('.status-indicator').classList.remove('indicator-red');
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from server');
            document.querySelectorAll('.chart-container, span, p').forEach(el => el.classList.add('animate-pulse'));
            document.getElementById('connection-status').textContent = 'Disconnected';
            document.querySelector('.status-indicator').classList.remove('indicator-green');
            document.querySelector('.status-indicator').classList.add('indicator-red');
        });

        socket.on('stats', (data) => {
            updateStats(data);
            updateTemperature(data.temperature);
        });

        document.addEventListener('DOMContentLoaded', function() {
            initCharts();
                Swal.fire({
                    title: 'Did You Know?',
                    text: 'statusMonitoring is an open-source project that you can explore on GitHub!',
                    icon: 'info',
                    background: '#1e2235',
                    color: '#fff',
                    iconColor: '#3B82F6',
                    showCancelButton: true,
                    confirmButtonColor: '#3B82F6',
                    cancelButtonColor: '#4B5563',
                    confirmButtonText: 'View Project',
                    cancelButtonText: 'Close',
                    customClass: {
                        title: 'text-2xl text-blue-300',
                        popup: 'border border-gray-700 rounded-xl'
                    }
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.open('https://github.com/ryhardiyan/monitoring', '_blank');
                    }
                });
        });
