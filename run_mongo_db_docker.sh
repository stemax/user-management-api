docker run -d --name uma_mongodb -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=password mongo
#docker exec -it uma_mongodb mongosh -u admin -p password --authenticationDatabase admin
