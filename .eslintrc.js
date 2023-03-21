const beaunusStyleConfig = require("@beaunus123/style-config").eslint;

module.exports = {
  ...beaunusStyleConfig,
  extends: [
    ...beaunusStyleConfig.extends,
    "plugin:tailwindcss/recommended",
    "plugin:@next/next/recommended",
  ],
  rules: { ...beaunusStyleConfig.rules, "react/react-in-jsx-scope": "off" },
  settings: {
    ...beaunusStyleConfig.settings,
    tailwindcss: {
      cssFiles: ["styles/**/*.css"],
    },
  },
};
