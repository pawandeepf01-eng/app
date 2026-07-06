const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/JobRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const reviewRoutes=require("./routes/reviewRoutes");



dotenv.config();


const app = express();

connectDB();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews",reviewRoutes);


app.get("/", (req, res) => {
  res.send("API Running...");
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server is running on port " + PORT);
});