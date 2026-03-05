#!/usr/bin/env python3

import os
import pymongo
from bson import ObjectId
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def debug_database():
    try:
        MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/beyondgrades")
        print(f"Connecting to: {MONGO_URI}")
        
        client = pymongo.MongoClient(MONGO_URI)
        
        # Connect to test database (same as server)
        db = client.test
        print(f"Connected to database: {db.name}")
        
        # List collections
        collections = db.list_collection_names()
        print(f"Collections: {collections}")
        
        # Test each collection
        for collection_name in collections:
            collection = db[collection_name]
            count = collection.count_documents({})
            print(f"  {collection_name}: {count} documents")
            
            # Show sample document for jobs
            if collection_name == 'jobs' and count > 0:
                sample = collection.find_one()
                print(f"    Sample job: {sample.get('title', 'No title')} - {sample.get('_id')}")
        
        # Test ObjectId conversion with a sample job ID
        print(f"\nTesting ObjectId conversion with sample ID: 68e2c58851306b095bb1c5b8")
        try:
            obj_id = ObjectId("68e2c58851306b095bb1c5b8")
            print(f"✅ ObjectId conversion successful: {obj_id}")
        except Exception as e:
            print(f"❌ ObjectId conversion failed: {e}")
        
        client.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    debug_database()
