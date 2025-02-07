const express = require("express")
const http = require("http")
const socketIo = require("socket.io")
const { getStats } = require("./lib/stats.js");
require("dotenv").config()

const app = express()
const server = http.createServer(app)
const io = socketIo(server)

app.use(express.static("public"))

io.on("connection", (socket) => {
  console.log("A client connected")

  const sendStats = async () => {
    const stats = await getStats()
    socket.emit("stats", stats)
  }
  sendStats()
  
  const interval = setInterval(sendStats, 3000)

  // Clean up on disconnect
  socket.on("disconnect", () => {
    console.log("A client disconnected")
    clearInterval(interval)
  })
})

const PORT = process.env.PORT || 8088
server.listen(PORT, () => {
  console.log(`The Server Is Running On http://localhost:${PORT}`)
})