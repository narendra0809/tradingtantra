module.exports = {
  apps: [
    {
      name: "backend",
      script: "app.js",
      max_memory_restart: "256M",
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
      autorestart: true,
      max_memory_restart: "512M",
      watch: false,
      restart_delay: 0,
      cron_restart: "10 9 * * 1-5", // restart immediately after crash
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};

