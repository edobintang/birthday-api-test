const express = require("express");
const usersRouter = require("./routes/users");

const app = express();

app.use(express.json());
app.use("/users", usersRouter);

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  return res.status(status).json({ error: message });
});

module.exports = app;
