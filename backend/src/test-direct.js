import { connectMongo } from "./connectMongo.js";
import { getEnvVar } from "./getEnvVar.js";

async function testDirect() {
    console.log("\n=== DIRECT DATABASE TEST ===\n");
    
    const client = connectMongo();
    
    try {
        console.log("1. Connecting to MongoDB...");
        await client.connect();
        console.log("2. Connected successfully!\n");
        
        const db = client.db();
        console.log("3. Database name:", db.databaseName);
        
        // List all collections
        const collections = await db.listCollections().toArray();
        console.log("4. Collections in database:");
        collections.forEach(c => console.log(`   - ${c.name}`));
        
        // Try to access the images collection
        const imagesCollection = db.collection(getEnvVar("IMAGES_COLLECTION_NAME"));
        
        // Count documents
        const count = await imagesCollection.countDocuments();
        console.log(`\n5. Documents in images collection: ${count}`);
        
        if (count > 0) {
            // Get one document
            const oneDoc = await imagesCollection.findOne();
            console.log("\n6. Sample document:");
            console.log(JSON.stringify(oneDoc, null, 2));
            
            // Get all documents
            const allDocs = await imagesCollection.find().toArray();
            console.log(`\n7. All documents (${allDocs.length}):`);
            allDocs.forEach((doc, i) => {
                console.log(`\n   Document ${i + 1}:`);
                console.log(`   _id: ${doc._id}`);
                console.log(`   name: ${doc.name}`);
                console.log(`   authorId: ${doc.authorId}`);
                console.log(`   src: ${doc.src.substring(0, 50)}...`);
            });
        } else {
            console.log("\n6. No documents found in collection");
        }
        
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await client.close();
        console.log("\n8. Connection closed");
    }
}

testDirect();