$ErrorActionPreference = "Stop"

$env:SPRING_PROFILES_ACTIVE = "local"
$env:DB_URL = "jdbc:mysql://localhost:3306/sistema_cpsp?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=America/Lima"
$env:DB_USERNAME = "root"
$env:DB_PASSWORD = "admin"

.\mvnw.cmd clean spring-boot:run
