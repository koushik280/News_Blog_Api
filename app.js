import express from "express";
import cookieParser from "cookie-parser";

import cors from "cors";
import authRoutes from "./app/routes/auth.routes.js";
import newsRoutes from "./app/routes/news.routes.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./app/config/swagger.js";
import adminRoutes from "./app/routes/admin.route.js";

const app = express();
app.use(express.json());
app.use(cookieParser());
const allowedOrigins = [
  "http://localhost:3000", // React
  "http://localhost:5173", // Vite
  "https://news-blog-api.onrender.com", // Swagger / same domain safe
  // add your deployed frontend later:
  // "https://your-frontend.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow REST tools & same-origin
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed for this origin"));
      }
    },
    credentials: true,
  }),
);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/auth", authRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.json({ message: "News API is running" });
});

export default app;
