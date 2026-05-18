from pymongo import MongoClient

MONGO_URI = "mongodb://localhost:27017/"

client = MongoClient(MONGO_URI)

db = client["campuscore"]

courses_collection = db["courses"]
rooms_collection = db["rooms"]

jobs_collection = db["jobs"]

services_collection = db["services"]