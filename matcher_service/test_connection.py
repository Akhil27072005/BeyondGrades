#!/usr/bin/env python3

import os
import pymongo
from bson import ObjectId
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_connection():
    try:
        # Test database connection
        MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/beyondgrades")
        print(f"Connecting to: {MONGO_URI}")
        
        client = pymongo.MongoClient(MONGO_URI)
        db = client.beyondgrades
        
        # Test database ping
        client.admin.command('ping')
        print("✅ Database connection successful")
        
        # Test collections
        collections = db.list_collection_names()
        print(f"Collections: {collections}")
        
        # Test if we're connected to the right database
        print(f"Database name: {db.name}")
        
        # Test jobs collection
        jobs_count = db.jobs.count_documents({})
        print(f"Jobs count: {jobs_count}")
        
        # Test students collection
        students_count = db.students.count_documents({})
        print(f"Students count: {students_count}")
        
        # Test projects collection
        projects_count = db.projects.count_documents({})
        print(f"Projects count: {projects_count}")
        
        # Test a specific job
        if jobs_count > 0:
            job = db.jobs.find_one({})
            print(f"Sample job: {job.get('title', 'No title')} - {job.get('_id')}")
            
            # Test matching logic
            job_id = str(job['_id'])
            print(f"Testing job ID: {job_id}")
            
            # Test ObjectId conversion
            try:
                obj_id = ObjectId(job_id)
                print(f"✅ ObjectId conversion successful: {obj_id}")
            except Exception as e:
                print(f"❌ ObjectId conversion failed: {e}")
        
        client.close()
        print("✅ All tests passed")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_connection()
