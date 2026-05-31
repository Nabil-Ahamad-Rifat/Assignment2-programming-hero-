import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { env } from "./config/env";
import { initializeDatabase } from "./config/dbInit";

const startServer = async () => {
  try {
    // Initialize database tables
    await initializeDatabase();

    // Start the server
    app.listen(env.port, () => {
      console.log(`DevPulse API running on port ${env.port} [${env.nodeEnv}]`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
