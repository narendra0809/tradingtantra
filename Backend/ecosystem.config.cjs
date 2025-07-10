module.exports = {
  apps: [
    {
      name: "backend",
      script: "app.js",
      max_memory_restart: "1024M",
      autorestart: true,
      watch: false,
      restart_delay: 0, // restart immediately after crash
      cron_restart: "10 9 * * 1-5", // restart at 9:10 AM, Mon-Fri
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "option-chain",
      script: "chain.js",
      max_memory_restart: "512M",
      autorestart: true,
      watch: false,
      restart_delay: 0, // restart immediately after crash
      cron_restart: "10 9 * * 1-5", // restart at 9:10 AM, Mon-Fri
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
