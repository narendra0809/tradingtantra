import { exec } from "child_process";
export const initiateRestart = (pm2Command) => {
  setTimeout(() => {
    exec(pm2Command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Restart error: ${error}`);
        throw new Error({
          error: "Failed to restart server",
          details: isProduction ? undefined : error.message,
        });
      }
    });
  }, 2000);
};
