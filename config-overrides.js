module.exports = {
  webpack: function override(config) {
    // Suppress "Critical dependency: the request of a dependency is an expression"
    // warning from react-datepicker's dynamic date-fns locale imports.
    config.ignoreWarnings = [
      {
        module: /react-datepicker/,
        message: /Critical dependency/,
      },
    ];
    return config;
  },
  jest: function (config) {
    // Transform axios ESM so Jest can parse it
    config.transformIgnorePatterns = ["/node_modules/(?!(axios)/)"];
    return config;
  },
};
