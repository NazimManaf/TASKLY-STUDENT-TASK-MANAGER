const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "A title is required."],
      trim: true,
      maxlength: [120, "Title must be 120 characters or fewer."],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description must be 1,000 characters or fewer."],
      default: "",
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Task", taskSchema);
