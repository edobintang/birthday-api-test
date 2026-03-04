const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    birthday: { type: String, required: true },
    timezone: { type: String, required: true },
    lastNotifiedYear: { type: Number, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
