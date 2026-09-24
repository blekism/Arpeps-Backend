import express, { Application } from "express";
import cors from "cors";
import dotenv from "dotenv";
import itemsRouter from "./routes/items.routes";
import { errorHandler } from "./middleware/errorHandler";
import authRouter from "./routes/auth.routes";
import helmet from "helmet";
import { issueCsrfToken } from "./middleware/csrf";
import paperRoutes from "./routes/papers.routes";
import cookieParser from "cookie-parser";

dotenv.config();

const app: Application = express();

const allowedOrigins = ["http://localhost:3000", "https://samplesite.com"];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(issueCsrfToken);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/csrf-token", issueCsrfToken, (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/concepts", itemsRouter);
app.use("/api/auth", authRouter);
app.use("/api/papers", paperRoutes);

// 404 for unmatched routes
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use(errorHandler);

export default app;
