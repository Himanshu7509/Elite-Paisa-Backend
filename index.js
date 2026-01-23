import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import dbConnect from "./src/utils/mongodb.js";
import authRoute from "./src/routes/auth.route.js";
import profileRoute from "./src/routes/profile.route.js";
import passwordRoute from "./src/routes/password.route.js";
import loanTypeRoute from "./src/routes/loanType.route.js";
import loanApplicationRoute from "./src/routes/loanApplication.route.js";
import dashboardRoute from "./src/routes/dashboard.route.js";

dotenv.config()
const app = express()
app.use(cors({
  origin: "*", // Allow access from any origin
  credentials: true, // Enable credentials if needed
}));
app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));


dbConnect();

// Routes
app.use("/api/auth", authRoute);
app.use("/api/profile", profileRoute);
app.use("/api/password", passwordRoute);
app.use("/api/loan-types", loanTypeRoute);
app.use("/api/loan-applications", loanApplicationRoute);
app.use("/api/dashboard", dashboardRoute);

app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

export default app;