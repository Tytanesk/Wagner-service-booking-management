import { pool } from '../db.js';


export async function getAllClients() {
    const { rows } = await pool.query(`SELECT * FROM clients ORDER BY id ASC`);
    return rows;
}


export async function createNewClient({ name, api_key, organization }) {
    const result = await pool.query(
        `INSERT INTO clients (name) VALUES ($1) RETURNING id`,
        [name]
    );
    const clientId = result.rows[0].id;


    await pool.query(
        `INSERT INTO client_credentials (client_id, api_key, organization) VALUES ($1, $2, $3)`,
        [clientId, api_key, organization]
    );


    return { clientId };
}