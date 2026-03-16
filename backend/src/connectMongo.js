import { MongoClient } from "mongodb";
import { getEnvVar } from "./getEnvVar.js";

export function connectMongo() {
    const MONGO_USER = getEnvVar("MONGO_USER");
    const MONGO_PWD = getEnvVar("MONGO_PWD");
    const MONGO_CLUSTER = getEnvVar("MONGO_CLUSTER");
    const DB_NAME = getEnvVar("DB_NAME");
    const MONGO_OPTIONS = getEnvVar("MONGO_OPTIONS", false) || "";

    const encodedPassword = encodeURIComponent(MONGO_PWD);

    const connectionStringRedacted = `mongodb+srv://${MONGO_USER}:<password>@${MONGO_CLUSTER}/${DB_NAME}${MONGO_OPTIONS}`;
    const connectionString = `mongodb+srv://${MONGO_USER}:${encodedPassword}@${MONGO_CLUSTER}/${DB_NAME}${MONGO_OPTIONS}`;

    console.log("Attempting Mongo connection at " + connectionStringRedacted);

    return new MongoClient(connectionString);
}