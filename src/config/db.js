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
    console.log(
      `Database is Connected...${process.env.MONGO_DB_NAME ? ` (${process.env.MONGO_DB_NAME})` : ""}`
    );
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};

module.exports = ConnectDB;
