import express, { Request, Response } from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

/* ROUTE IMPORTS */
import projectRoutes from "./routes/projectRoutes";
import taskRoutes from "./routes/taskRoutes";
import searchRoutes from "./routes/searchRoutes";
import userRoutes from "./routes/userRoutes";
import teamRoutes from "./routes/teamRoutes";

/* CONFIGURATIONS */
dotenv.config();
const app = express();

// 1. LOGGER FIRST
app.use(morgan("common"));

// 2. CORS CONFIGURATION (MUST be before helmet)
app.use(cors({
  origin: 
  // [
    'http://localhost:3000',
    // 'https://main.dbfnxdceymc08.amplifyapp.com',
  // ],
  // 'https://t4zf9qe6xf.execute-api.eu-north-1.amazonaws.com'
  // methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  // allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  // optionsSuccessStatus: 204
}));

// 3. Handle preflight OPTIONS requests
app.options('*', cors());

// 4. HELMET AFTER CORS
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// 5. BODY PARSERS
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

/* ROUTES */
app.get("/", (req: Request, res: Response) => {
  res.send("This is home route");
});

app.use("/projects", projectRoutes);
app.use("/tasks", taskRoutes);
app.use("/search", searchRoutes);
app.use("/users", userRoutes);
app.use("/teams", teamRoutes);

/* SERVER */
const port = Number(process.env.PORT) || 3000;
app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});
