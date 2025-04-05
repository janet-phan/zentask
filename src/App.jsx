import React from "react";
import { useState } from "react";
import { motion } from "framer-motion";


export default function App() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");

  const addTask = () => {
    if (!input.trim()) return;
  
    const newTask = {
      id: Date.now(),
      text: input,
      done: false,
    };
  
    setTasks([...tasks, newTask]);
    setInput("");
  
    fetch("http://localhost:4000/add-task", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newTask),
    })
      .then((res) => res.json())
      .then(console.log)
      .catch(console.error);    
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, done: !task.done } : task
    ));
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
                task.done ? "bg-green-100 line-through text-gray-500" : "bg-gray-100"
              }`}              
            >
              <span>{task.text}</span>
                <button onClick={() => toggleTask(task.id)}>
                  {task.done ? "✅" : "⬜"}
                </button>
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
}
