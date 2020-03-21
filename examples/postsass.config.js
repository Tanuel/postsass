module.exports = {
  postcss: {
    plugins: [
      require("autoprefixer")({ grid: "autoplace" }),
      require("oldie")({
        rgba: {
          filter: true,
        },
      }),
    ],
  },
};
