#!/usr/bin/env python3

import os
import pymongo
from dotenv import load_dotenv

load_dotenv()

def get_jobs():
    try:
        client = pymongo.MongoClient(os.getenv('MONGO_URI'))
        db = client.test
        jobs = list(db.jobs.find({}))
        
        print("Available jobs:")
        for job in jobs:
            print(f"  {job['_id']} - {job.get('title', 'No title')}")
        
        client.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    get_jobs()
