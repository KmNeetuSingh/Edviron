require("dotenv").config({override:true});
const express = require("express");
const connectDB = require("./config/db");
connectDB();
const PORT = process.env.PORT || 5000;
const app = express();
app.get("/", (req, res) => {
  res.send("Server health is good");
});
app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
