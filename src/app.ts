import express, { Application } from "express";
import cors from "cors";
import dotenv from "dotenv";
import itemsRouter from "./routes/items.routes";
import { errorHandler } from "./middleware/errorHandler";
import authRouter from "./routes/auth.routes";
import helmet from "helmet";
import { issueCsrfToken } from "./middleware/csrf";

dotenv.config();

const app: Application = express();

app.use(
  cors({
    origin: "http://localhost:3000",
  }),
);
app.use(helmet());
app.use(express.json());
app.use(issueCsrfToken);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/concepts", itemsRouter);
app.use("/api/auth", authRouter);

// 404 for unmatched routes
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use(errorHandler);

export default app;
