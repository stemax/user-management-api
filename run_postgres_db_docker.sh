docker run --name myPostgresDb -p 5455:5432 -e POSTGRES_USER=postgresUser -e POSTGRES_PASSWORD=postgresPW  -e POSTGRES_DB=postgresDB  -d postgres
