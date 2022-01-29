const beaunusStyleConfig = require("@beaunus123/style-config").eslint;

module.exports = {
  ...beaunusStyleConfig,
  extends: [
    ...beaunusStyleConfig.extends,
    "plugin:tailwindcss/recommended",
    "plugin:@next/next/recommended",
  ],
  settings: {
    ...beaunusStyleConfig.settings,
    tailwindcss: {
      cssFiles: ["styles/**/*.css"],
    },
  },
};
