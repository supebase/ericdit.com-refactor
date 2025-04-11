module.exports = {
  apps: [
    {
      name: "Eric",
      exec_mode: "cluster",
      instances: "max",
      env: {
        NITRO_PORT: 24000,
        NITRO_HOST: "0.0.0.0",
        NODE_ENV: 'production',
      },
      script: "./.output/server/index.mjs",
    },
  ],
};
