import mongoose from "mongoose";

//this function will connect to the MongoDB database and we use mongoose to connect to the database.
const connectDB = async () => {
  try {
    //if the MONGODB_URL environment variable is not set, we throw an error
    if (!process.env.MONGODB_URL) {
      throw new Error("MONGODB_URL environment variable is not set");
    }
    mongoose.connection.on("connected", () => {
        console.log("MongoDB Connected");
        });
    const conn = await mongoose.connect(process.env.MONGODB_URL);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}
export default connectDB;