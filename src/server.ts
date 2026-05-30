import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { env } from "./config/env";

app.listen(env.port, () => {
  console.log(`DevPulse API running on port ${env.port} [${env.nodeEnv}]`);
});
