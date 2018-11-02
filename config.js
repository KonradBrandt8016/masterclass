// container to hold all environments
const environments = {};
environments.staging = {
  envName: "staging",
  httpPort: 3000,
  httpsPort: 3001
};

environments.production = {
  envName: "production",
  httpPort: 5000,
  httpsPort: 5001
};

// determine the environment that was passed as a command line argument
const currentEnvironment =
  typeof process.env.NODE_ENV == "string" ? process.env.NODE_ENV : "";

// check that the environment exists, else default to 'staging'
const environmentToExport =
  typeof environments[currentEnvironment] == "object"
    ? environments[currentEnvironment]
    : environments.staging;

module.exports = environmentToExport;
