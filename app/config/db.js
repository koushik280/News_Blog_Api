import mongoose from "mongoose";
/**
 * Connection application to mongodb
 */

const connectDb = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDb connected ${connection.connection.host}`)
  } catch (error) {

     console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDb;
