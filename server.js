import dotenv from "dotenv";
dotenv.config();
import app from "./app.js";
import connectDb from "./app/config/db.js";

const PORT = process.env.PORT || 5000;

connectDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is runnig port ${PORT}`);
  });
});
