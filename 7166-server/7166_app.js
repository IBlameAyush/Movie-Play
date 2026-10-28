import helmet from "helmet";
import rateLimit from "express-rate-limit";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import movieRoutes from "./7166_routes/7166_movieRoutes.js";
import authRoutes from "./7166_routes/7166_authRoutes.js";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.get("/api/7166/health", (req, res) => {
  res.json({
    success: true,
    message: "Movie Streaming API is working!",
  });
});

app.use("/api/7166/movies", movieRoutes);
app.use("/api/7166/auth", authRoutes);

app.use(helmet());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: "Too many attempts. Try again later." },
});
app.use("/api/7166/auth/login", authLimiter);
app.use("/api/7166/auth/register", authLimiter);
export default app;
