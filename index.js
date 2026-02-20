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
app.set('trust proxy', 1);

/* ===============================
   CORS (VERY IMPORTANT)
================================ */
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'https://www.elitepaisa.com',
  'https://elitepaisa.com',
  'https://elite-paisa-crm.vercel.app',

];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);


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