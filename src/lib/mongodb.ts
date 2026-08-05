import { MongoClient, type Db } from "mongodb";

const DB_NAME = process.env.MONGO_DB_NAME?.trim() || "thailandKitchen";

const globalForMongo = globalThis as unknown as {
  _mongoClientPromise?: Promise<MongoClient>;
};

function getMongoUri() {
  return (
    process.env.MONGO_URI?.trim() ||
    process.env.MONGODB_URI?.trim() ||
    ""
  );
}

export function hasMongoUri() {
  return Boolean(getMongoUri());
}

async function getClient(): Promise<MongoClient> {
  const uri = getMongoUri();
  if (!uri) {
    throw new Error(
      "MONGO_URI is not defined. Add it in Vercel → Settings → Environment Variables, then Redeploy."
    );
  }

  if (!globalForMongo._mongoClientPromise) {
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      maxIdleTimeMS: 10000,
    });

    globalForMongo._mongoClientPromise = client.connect().catch((err) => {
      globalForMongo._mongoClientPromise = undefined;
      throw err;
    });
  }

  return globalForMongo._mongoClientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getClient();
  return client.db(DB_NAME);
}
