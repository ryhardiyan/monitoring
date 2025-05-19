# StatsMonit

**StatsMonit** is a lightweight server monitoring tool built with **Node.js** and **Socket.io**. It provides real-time system statistics, including **CPU usage, RAM usage, disk space, network activity**, and **uptime**.

## 🚀 Features

- **Real-time Monitoring**: Get live updates every 3 seconds.
- **CPU Usage**: Shows CPU load percentage and model details.
- **Memory Usage**: Displays RAM consumption with detailed usage statistics.
- **Disk Statistics**: Provides total, used, and available disk space.
- **Network Traffic**: Monitors incoming and outgoing network activity.
- **Cross-platform**: Works on Linux, Windows, and macOS.

## 📦 Installation

### Prerequisites
- **Node.js** (v18 or higher)
- **NPM** (comes with Node.js)

### Steps
1. Clone this repository:
   ```bash
   git clone https://github.com/ryhardiyan/monitoring
   ```
2. Navigate into the project folder:
   ```bash
   cd monitoring
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. (Optional) Configure environment variables:  
   Create a `.env` file and specify the port (default: `8088`).
   ```env
   PORT=8088
   ```

## 🛠 Usage

### Start the Server
Run the following command to start the monitoring service:
```bash
npm start
```
or manually using:
```bash
node index.js
```

### Access the Dashboard
Once the server is running, open your browser and visit:
```
http://localhost:8088
```
The server will continuously send system statistics to the client using **WebSockets (Socket.io)**.

## ⚙️ How It Works

1. **Server Setup**  
   - Uses **Express.js** to serve static files.
   - Runs an **HTTP server** with **Socket.io** for real-time communication.

2. **Data Collection**  
   - Uses **OS module** to fetch CPU, RAM, and system details.
   - Uses **diskusage** to check disk space.
   - Uses **node-os-utils** to fetch CPU and network statistics.

3. **Real-time Updates**  
   - The server collects system stats every **3 seconds**.
   - Data is sent to connected clients via **WebSockets**.

## 🏗 Build Tailwind CSS

If you are using **Tailwind CSS** for styling, you can compile the CSS using:
```bash
npm run build
```
This will generate a minified CSS file for production.

## 🤝 Contributing

Contributions are welcome! Feel free to **open an issue** or **submit a pull request** if you find any improvements or bugs.

## 📜 License

This project is licensed under the **MIT License**.