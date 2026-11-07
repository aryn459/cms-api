import app from "./app";
import {
  connectDatabase,
  disconnectDatabase
} from "./config/database";
import { env } from "./config/environment";

const PORT = env.port;

async function startServer() {
  try {
    console.log("Starting CMS API...");

    // Connect to PostgreSQL
    await connectDatabase();

    console.log("PostgreSQL connected successfully");

    // Start Express server
    const server = app.listen(PORT, () => {
      console.log("--------------------------------");
      console.log("CMS API STARTED SUCCESSFULLY");
      console.log(`Server: http://localhost:${PORT}`);
      console.log("--------------------------------");
    });

    // Graceful shutdown
    let isShuttingDown = false;

    const shutdown = async () => {
      if (isShuttingDown) return;

      isShuttingDown = true;

      console.log("Shutting down CMS API...");

      server.close(async (error) => {
        if (error) {
          console.error("Server shutdown error:", error);
        }

        try {
          await disconnectDatabase();
          console.log("Database disconnected");
          process.exit(error ? 1 : 0);
        } catch (dbError) {
          console.error("Database disconnect failed:", dbError);
          process.exit(1);
        }
      });
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);

  } catch (error) {
    console.error("Server startup failed:", error);

    try {
      await disconnectDatabase();
    } catch (dbError) {
      console.error("Database disconnect failed:", dbError);
    }

    process.exit(1);
  }
}

void startServer();
