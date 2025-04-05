import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    fetch("http://localhost:4000/tasks")
      .then((res) => res.json())
      .then((data) => {
        console.log("📥 Loaded tasks from Google Sheets:", data);
        setTasks(data);
      })
      .catch((error) => {
        console.error("Failed to load tasks:", error);
      });
  }, []);

  const addTask = () => {
    if (!input.trim()) return;

    const newTask = {
      id: Date.now(),
      text: input.trim(),
      done: false,
    };

    // Add new task and trim if over 50
    let updatedTasks = [...tasks, newTask];

    if (updatedTasks.length > 50) {
      const activeTasks = updatedTasks.filter((t) => !t.done);
      const completedTasks = updatedTasks.filter((t) => t.done);

      const excess = updatedTasks.length - 50;
      const trimmedCompleted = completedTasks.slice(
        0,
        completedTasks.length - excess
      );

      updatedTasks = [...activeTasks, ...trimmedCompleted];
    }

    setTasks(updatedTasks);
    setInput("");

    // Save to Google Sheets via backend
    fetch("http://localhost:4000/add-task", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTask),
    })
      .then((res) => res.text())
      .then(console.log)
      .catch(console.error);
  };

  const toggleTask = (id) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, done: !task.done } : task
    );
  
    const toggledTask = updatedTasks.find((task) => task.id === id);
  
    setTasks(updatedTasks);
  
    fetch("http://localhost:4000/update-task", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id,
        done: toggledTask.done,
        update: true,
      }),
    })
      .then((res) => res.json())
      .then(console.log)
      .catch(console.error);
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));

    fetch("http://localhost:4000/delete-task", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, delete: true }), // ✅ Send delete flag
    })
      .then((res) => res.json())
      .then(console.log)
      .catch(console.error);
  };

  const clearCompleted = () => {
    const completed = tasks.filter((task) => task.done);
    const remaining = tasks.filter((task) => !task.done);

    setTasks(remaining);

    completed.forEach((task) => {
      fetch("http://localhost:4000/delete-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: task.id, delete: true }), // ✅ Send delete flag
      })
        .then((res) => res.json())
        .then(console.log)
        .catch(console.error);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-4">
      <motion.div
        className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-gray-700 mb-4">ZenTask</h1>
        <div className="flex gap-2 mb-4">
          <input
            className="flex-1 border border-gray-300 rounded-xl px-4 py-2"
            placeholder="What do you need to do?"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
          />
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-xl"
            onClick={addTask}
          >
            Add
          </button>
        </div>
        <ul>
          {tasks.map((task) => (
            <motion.li
              key={task.id}
              className={`py-2 px-4 mb-2 rounded-xl flex justify-between items-center ${
                task.done
                  ? "bg-green-100 line-through text-gray-500"
                  : "bg-gray-100"
              }`}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex gap-3 items-center">
                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-red-500 hover:text-red-700"
                  title="Delete task"
                >
                  ❌
                </button>
                <span>{task.text}</span>
              </div>
              <button onClick={() => toggleTask(task.id)}>
                {task.done ? "✅" : "⬜"}
              </button>
            </motion.li>
          ))}
        </ul>
        {tasks.some((task) => task.done) && (
          <button
            onClick={clearCompleted}
            className="mt-4 bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600"
          >
            Clear All Completed
          </button>
        )}
      </motion.div>
    </div>
  );
}
