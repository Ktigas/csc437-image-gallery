import { getEnvVar } from "./getEnvVar.js";
import { ObjectId } from "mongodb"; // Add this import

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

    // New method for getting a single image by ID
    async getImageById(id) {
        try {
            console.log(`Fetching image with ID: ${id}`);
            
            // Convert string ID to ObjectId
            const objectId = new ObjectId(id);
            
            // Get the image
            const image = await this.imagesCollection.findOne({ _id: objectId });
            
            if (!image) {
                return null;
            }
            
            // Get the author from users collection
            const author = await this.usersCollection.findOne({ username: image.authorId });
            
            // Transform to match frontend expectations with denormalized author
            const transformedImage = {
                _id: image._id.toString(),
                src: image.src,
                name: image.name,
                author: author ? {
                    _id: author._id.toString(),
                    username: author.username,
                    email: author.email
                } : {
                    _id: image.authorId,
                    username: image.authorId,
                    email: "unknown@example.com"
                }
            };
            
            return transformedImage;
        } catch (error) {
            console.error("Error in getImageById:", error);
            throw error;
        }
    }

    // New method for updating image name
    async updateImageName(id, newName) {
        try {
            console.log(`Updating image ${id} with new name: ${newName}`);
            
            // Convert string ID to ObjectId
            const objectId = new ObjectId(id);
            
            // Update the image name
            const result = await this.imagesCollection.updateOne(
                { _id: objectId },
                { $set: { name: newName } }
            );
            
            console.log(`Update result - matched: ${result.matchedCount}, modified: ${result.modifiedCount}`);
            
            // Return the number of matched documents
            return result.matchedCount;
        } catch (error) {
            console.error("Error in updateImageName:", error);
            throw error;
        }
    }
}