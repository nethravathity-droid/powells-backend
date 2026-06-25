const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const seedAdmin = require("./utils/seedAdmin");

const app = express();

app.set("trust proxy", 1);

app.use(cors({
  origin: [
    "https://www.powellsindiacorporation.com",
    "https://powellsindiacorporation.com",
    "http://localhost:5173",
    "http://127.0.0.1:5173"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api", require("./routes/callback"));
app.use("/api", require("./routes/inquiry"));
app.use("/api", require("./routes/subscribe"));
app.use("/api", require("./routes/channelPartner"));
app.use("/api", require("./routes/orders"));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB Connected");
    await seedAdmin();
  })
  .catch((err) => console.log(err));

// Start server (ONLY ONCE)
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
