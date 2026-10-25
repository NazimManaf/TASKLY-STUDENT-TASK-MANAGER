const express = require("express");
const mongoose = require("mongoose");
const Task = require("../models/Task");

const router = express.Router();

function asyncRoute(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

function isValidTaskId(id) {
  return mongoose.isValidObjectId(id);
}

router.get(
  "/",
  asyncRoute(async (_req, res) => {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  }),
);

router.post(
  "/",
  asyncRoute(async (req, res) => {
    const { title, description } = req.body ?? {};

    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ message: "A non-empty title is required." });
    }
    if (title.trim().length > 120) {
      return res.status(400).json({ message: "Title must be 120 characters or fewer." });
    }
    if (description !== undefined && typeof description !== "string") {
      return res.status(400).json({ message: "Description must be a string." });
    }
    if (description?.length > 1000) {
      return res.status(400).json({ message: "Description must be 1,000 characters or fewer." });
    }

    const task = await Task.create({ title, description });
    res.status(201).json(task);
  }),
);

router.patch(
  "/:id",
  asyncRoute(async (req, res) => {
    if (!isValidTaskId(req.params.id)) {
      return res.status(400).json({ message: "Invalid task ID." });
    }
    if (
      !req.body ||
      typeof req.body.completed !== "boolean" ||
      Object.keys(req.body).some((key) => key !== "completed")
    ) {
      return res.status(400).json({ message: "Provide only a boolean completed value." });
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { completed: req.body.completed },
      { new: true, runValidators: true },
    );
    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }
    res.json(task);
  }),
);

router.delete(
  "/:id",
  asyncRoute(async (req, res) => {
    if (!isValidTaskId(req.params.id)) {
      return res.status(400).json({ message: "Invalid task ID." });
    }

    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }
    res.status(204).end();
  }),
);

module.exports = router;
