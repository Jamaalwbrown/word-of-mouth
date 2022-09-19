const mongoose = require("mongoose");

const GroupSchema = new mongoose.Schema({
  groupName: {
    type: String,
    required: false,
  },
  groupDescription: {
    type: String,
    required: false,
  },
  memberCount: {
    type: Number,
    required: false,
  },
  /*
  members: {
    type: [mongoose.Schema.Types.ObjectId],
    required: false,
  },
  moderators: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User",
  },*/
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Group", GroupSchema);