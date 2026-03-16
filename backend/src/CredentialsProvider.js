import bcrypt from "bcrypt";
import { getEnvVar } from "./getEnvVar.js";

const CREDS_COLLECTION = getEnvVar("CREDS_COLLECTION_NAME");
const USERS_COLLECTION = "users";

export const CredentialsProvider = {
    async registerUser(db, username, email, password) {
        const credsCollection = db.collection(CREDS_COLLECTION);
        const usersCollection = db.collection(USERS_COLLECTION);

        const existingUser = await credsCollection.findOne({ username });
        if (existingUser) {
            return false;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await credsCollection.insertOne({
            username: username,
            password: hashedPassword
        });

        await usersCollection.insertOne({
            username: username,
            email: email,
            createdAt: new Date()
        });

        return true;
    },

    async verifyPassword(db, username, password) {
        const credsCollection = db.collection(CREDS_COLLECTION);

        const user = await credsCollection.findOne({ username });
        if (!user) {
            return false;
        }

        return await bcrypt.compare(password, user.password);
    }
};