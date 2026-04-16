import mongoose from "mongoose";
import { env } from "../../config/env";
import { logger } from "../logging/logger";

export const connectDB = async () => {
  try {
    await mongoose.connect(env.mongoUri);
    logger.info("db_connected");
  } catch (error) {
    logger.error("db_connection_error", {
      error: error instanceof Error ? error.message : String(error),
    });
    process.exit(1);
  }
};
