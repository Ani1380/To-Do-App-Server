import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import salesforceRoutes from "./routes/routes.js";
import cache from 'memory-cache';


dotenv.config();
const app = express();
const port = process.env.PORT || 4321;
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());

app.use((req, res, next) => {
  next();
});


app.use('', salesforceRoutes);

app.listen({port}, "0.0.0.0", () => console.log(`Server running at http://0.0.0.0:${port}`));