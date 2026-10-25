const fs = require("node:fs");
const { EventEmitter } = require("node:events");

const taskEvents = new EventEmitter();

taskEvents.on("task:added", (title) => {
  console.log(`Event listener received a new task: ${title}`);
});

fs.stat(__filename, (error, file) => {
  if (error) {
    console.error("Could not read the example file:", error);
    return;
  }
  console.log(`Callback-based async I/O: this file is ${file.size} bytes.`);
});

setTimeout(() => {
  taskEvents.emit("task:added", "Practice Node.js events");
}, 0);
