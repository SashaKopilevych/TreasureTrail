import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  user: "sashakopilevych",
  host: "localhost",
  port: 5432,
  password: "admin106",
  database: "Treasure_DB",
});

export default pool;
