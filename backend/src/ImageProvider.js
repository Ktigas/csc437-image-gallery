// backend/src/ImageProvider.js
import { getEnvVar } from "./getEnvVar.js";

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
            
            // Transform to match frontend expectations
            const transformedImages = images.map(img => ({
                _id: img._id.toString(),
                src: img.src,
                name: img.name,
                author: {
                    id: img.authorId,
                    username: img.authorId  // Using authorId as username for now
                }
            }));
            
            return transformedImages;
        } catch (error) {
            console.error("Error in getAllImages:", error);
            throw error;
        }
    }

    async getAllImagesDenormalized() {
        try {
            // First, get all users
            const users = await this.usersCollection.find().toArray();
            
            // Create a map of username to user object
            const userMap = {};
            users.forEach(user => {
                userMap[user.username] = {
                    _id: user._id.toString(),
                    username: user.username,
                    email: user.email
                };
            });
            
            console.log("User map created with keys:", Object.keys(userMap));
            
            // Get all images and denormalize
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
}