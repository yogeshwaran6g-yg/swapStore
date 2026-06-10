import dotenv from 'dotenv';
dotenv.config();

const env = {
    dbUrl  :process.env.DB_URL ||"",
    dbHost :process.env.DB_HOST ||"localhost",
    dbUser :process.env.DB_USER ||"root",
    dbName :process.env.DB_NAME ||"swapstore",
    dbPassword :process.env.DB_PASSWORD ||"password1234",
    dbPort : process.env.DB_PORT ||3306,
    
    jwtSecret :process.env.JWT_SECRET ||"secret"

};
export default env;