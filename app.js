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
app.use(
  cors({
    origin: "http://localhost:5713",
    Credential: true,
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
