const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

let tasks = []; // In-memory storage

io.on("connection", (socket) => {
  console.log("A user connected");

  // Send all tasks when user connects
  socket.emit("sync:tasks", tasks);

  // Create task
  socket.on("task:create", (task) => {
    tasks.push(task);
    io.emit("sync:tasks", tasks);
  });

  // Update task
  socket.on("task:update", (updatedTask) => {
    tasks = tasks.map((task) =>
      task.id === updatedTask.id ? updatedTask : task
    );
    io.emit("sync:tasks", tasks);
  });

  // Move task
  socket.on("task:move", ({ id, status }) => {
    tasks = tasks.map((task) =>
      task.id === id ? { ...task, status } : task
    );
    io.emit("sync:tasks", tasks);
  });

  // Delete task
  socket.on("task:delete", (id) => {
    tasks = tasks.filter((task) => task.id !== id);
    io.emit("sync:tasks", tasks);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(5000, () => console.log("Server running on port 5000"));
