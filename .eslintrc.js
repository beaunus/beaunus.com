const beaunusStyleConfig = require("@beaunus123/style-config").eslint;

module.exports = {
  ...beaunusStyleConfig,
  extends: [
    ...beaunusStyleConfig.extends,
    "next/core-web-vitals",
    "plugin:tailwindcss/recommended",
  ],
};
