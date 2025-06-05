import "./config/dotenv";
import express from "express";
import mongoose from "mongoose";
import productRoutes from "./routes/productRoutes";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.use("/api/products", productRoutes);

mongoose
  .connect(process.env.MONGO_URL!)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });
