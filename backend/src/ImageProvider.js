import { getEnvVar } from "./getEnvVar.js";
import { ObjectId } from "mongodb";

export class ImageProvider {
    constructor(mongoClient) {
        this.mongoClient = mongoClient;
        this.imagesCollectionName = getEnvVar("IMAGES_COLLECTION_NAME");
        this.usersCollectionName = getEnvVar("USERS_COLLECTION_NAME");

        this.imagesCollection = this.mongoClient.db().collection(this.imagesCollectionName);
        this.usersCollection = this.mongoClient.db().collection(this.usersCollectionName);
    }

    async getAllImages() {
        try {
            console.log(`Querying collection: ${this.imagesCollectionName}`);
            const images = await this.imagesCollection.find().toArray();
            console.log(`Found ${images.length} images`);

            return images.map(img => ({
                _id: img._id.toString(),
                src: img.src,
                name: img.name,
                author: {
                    id: img.authorId,
                    username: img.authorId
                }
            }));
        } catch (error) {
            console.error("Error in getAllImages:", error);
            throw error;
        }
    }

    async getAllImagesDenormalized() {
        try {
            const users = await this.usersCollection.find().toArray();

            const userMap = {};
            users.forEach(user => {
                userMap[user.username] = {
                    _id: user._id.toString(),
                    username: user.username,
                    email: user.email
                };
            });

            console.log("User map created with keys:", Object.keys(userMap));

            const images = await this.imagesCollection.find().toArray();

            const denormalizedImages = images.map(img => ({
                _id: img._id.toString(),
                src: img.src,
                name: img.name,
                author: userMap[img.authorId] || {
                    _id: img.authorId,
                    username: img.authorId,
                    email: "unknown@example.com"
                }
            }));

            console.log(`Found ${denormalizedImages.length} denormalized images`);
            return denormalizedImages;
        } catch (error) {
            console.error("Error in getAllImagesDenormalized:", error);
            throw error;
        }
    }

    async getImageById(id) {
        try {
            console.log(`Fetching image with ID: ${id}`);
            const objectId = new ObjectId(id);
            const image = await this.imagesCollection.findOne({ _id: objectId });

            if (!image) return null;

            const author = await this.usersCollection.findOne({ username: image.authorId });

            return {
                _id: image._id.toString(),
                src: image.src,
                name: image.name,
                author: author
                    ? {
                          _id: author._id.toString(),
                          username: author.username,
                          email: author.email
                      }
                    : {
                          _id: image.authorId,
                          username: image.authorId,
                          email: "unknown@example.com"
                      }
            };
        } catch (error) {
            console.error("Error in getImageById:", error);
            throw error;
        }
    }

    async updateImageName(id, newName) {
        try {
            console.log(`Updating image ${id} with new name: ${newName}`);
            const objectId = new ObjectId(id);
            const result = await this.imagesCollection.updateOne(
                { _id: objectId },
                { $set: { name: newName } }
            );
            console.log(`Update result - matched: ${result.matchedCount}, modified: ${result.modifiedCount}`);
            return result.matchedCount;
        } catch (error) {
            console.error("Error in updateImageName:", error);
            throw error;
        }
    }

    // Lab 24: Insert a new image document and return its new ID
    async createImage({ src, name, authorId }) {
        try {
            console.log(`Creating new image: name=${name}, authorId=${authorId}`);
            const result = await this.imagesCollection.insertOne({
                src,
                name,
                authorId,
                createdAt: new Date()
            });
            console.log(`Created image with id: ${result.insertedId}`);
            return result.insertedId.toString();
        } catch (error) {
            console.error("Error in createImage:", error);
            throw error;
        }
    }
}
