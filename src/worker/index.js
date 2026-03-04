require("dotenv").config();
const cron = require("node-cron");
const connectDB = require("../config/db");
const { runBirthdayJob } = require("./birthdayWorker");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/birthday";

connectDB(MONGO_URI)
  .then(() => {
    cron.schedule("* * * * *", async () => {
      await runBirthdayJob();
    });
    console.log("Birthday worker started");
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  });
