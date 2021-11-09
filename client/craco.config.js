const esbuild = require("craco-esbuild");
const swc = require("craco-swc");

module.exports = {
  plugins: [
    {
      plugin: swc,
      options: {
        swcLoaderOptions: {
          jsc: {
            target: "es2016",
            transform: {
              react: {
                runtime: "automatic",
                refresh: true,
              },
            },
          },
        },
      },
    },
    {
      plugin: esbuild,
    },
  ],
};
