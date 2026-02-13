import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import "./KanbanBoard.css";

const socket = io("http://localhost:5000");

function KanbanBoard() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");

  useEffect(() => {
    socket.on("sync:tasks", (data) => {
      setTasks(data);
    });

    return () => {
      socket.off("sync:tasks");
    };
  }, []);

  const createTask = () => {
    if (!newTask.trim()) return;

    const task = {
      id: Date.now().toString(),
      title: newTask,
      status: "todo",
    };

    socket.emit("task:create", task);
    setNewTask("");
  };

  const moveTask = (id, status) => {
    socket.emit("task:move", { id, status });
  };

  const deleteTask = (id) => {
    socket.emit("task:delete", id);
  };

  // ✅ UPDATED renderColumn with counter badge
  const renderColumn = (status, title) => {
    const columnTasks = tasks.filter((task) => task.status === status);

    return (
      <div className="column">
        <h3>
          {title} ({columnTasks.length})
        </h3>

        {columnTasks.map((task) => (
          <div key={task.id} className="task-card">
            <p>{task.title}</p>

            <button onClick={() => moveTask(task.id, "todo")}>
              To Do
            </button>
            <button onClick={() => moveTask(task.id, "in-progress")}>
              In Progress
            </button>
            <button onClick={() => moveTask(task.id, "done")}>
              Done
            </button>
            <button onClick={() => deleteTask(task.id)}>
              Delete
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="board-container">
      <h1 className="board-title">Kanban Board</h1>

      <div className="task-input">
        <input
          type="text"
          placeholder="Enter task"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
        />
        <button onClick={createTask}>Add Task</button>
      </div>

      <div className="columns">
        {renderColumn("todo", "To Do")}
        {renderColumn("in-progress", "In Progress")}
        {renderColumn("done", "Done")}
      </div>
    </div>
  );
}

export default KanbanBoard;
