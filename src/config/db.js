const dns = require("dns");
const mongoose = require("mongoose");

// Windows/local DNS often refuses Node SRV lookups for mongodb+srv://
try {
  const servers = dns.getServers();
  if (!servers.includes("8.8.8.8")) {
    dns.setServers(["8.8.8.8", "1.1.1.1", ...servers]);
  }
} catch {
  /* ignore */
}

const ConnectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error("MONGO_URI is not defined");
    }

    const options = { serverSelectionTimeoutMS: 20000 };
    if (process.env.MONGO_DB_NAME) {
      options.dbName = process.env.MONGO_DB_NAME;
    }

    await mongoose.connect(uri, options);
    const dbName = mongoose.connection.name;
    const appEnv = String(process.env.APP_ENV || process.env.NODE_ENV || "development");
    console.log(
      `Database is Connected... ${dbName} [APP_ENV=${appEnv}]`
    );

    const productionName = String(process.env.MONGO_DB_NAME_PRODUCTION || "").trim();
    if (
      appEnv.toLowerCase() === "staging" &&
      productionName &&
      dbName === productionName
    ) {
      throw new Error(
        `Staging APP_ENV is connected to production database "${dbName}". Use a separate MONGO_DB_NAME.`
      );
    }
    if (
      appEnv.toLowerCase() === "production" &&
      /stag/i.test(dbName)
    ) {
      throw new Error(
        `Production APP_ENV cannot use staging database "${dbName}".`
      );
    }
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};

module.exports = ConnectDB;
