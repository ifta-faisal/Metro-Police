import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Import all routes
import authRoutes from "./routes/auth.js";
import trafficFinesRoutes from "./routes/trafficFines.js";
import crimeReportsRoutes from "./routes/crimeReports.js";
import lostItemsRoutes from "./routes/lostItems.js";
import missingPersonsRoutes from "./routes/missingPersons.js";
import missingVehiclesRoutes from "./routes/missingVehicles.js";
import pccRoutes from "./routes/pcc.js";
import mapsRoutes from "./routes/maps.js";
import safeRouteRoutes from "./routes/safeRoute.js";
import sosRoutes from "./routes/sos.js";
import crimePredictionRoutes from "./routes/crimePrediction.js";
import chatbotRoutes from "./routes/chatbot.js";
import criminalsRoutes from "./routes/criminals.js";
import reportsRoutes from "./routes/reports.js";
import gdRoutes from "./routes/gd.js";
import missingRoutes from "./routes/missing.js";
import adminRoutes from "./routes/admin.js";
import alertsRoutes from "./routes/alerts.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/traffic-fines", trafficFinesRoutes);
app.use("/api/crime-reports", crimeReportsRoutes);
app.use("/api/lost-items", lostItemsRoutes);
app.use("/api/missing-persons", missingPersonsRoutes);
app.use("/api/missing-vehicles", missingVehiclesRoutes);
app.use("/api/pcc", pccRoutes);
app.use("/api/maps", mapsRoutes);
app.use("/api/safe-route", safeRouteRoutes);
app.use("/api/sos", sosRoutes);
app.use("/api/crime-prediction", crimePredictionRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/criminals", criminalsRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/gd", gdRoutes);
app.use("/api/missing", missingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/alerts", alertsRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Metro Police API is running" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
  console.log(`📡 API endpoints available at http://localhost:${PORT}/api`);
});
