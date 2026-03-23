import { createNewClient, getAllClients } from './clients.service.js';


export async function listClients(req, res) {
    const data = await getAllClients();
    res.json({ success: true, data });
}


export async function createClient(req, res) {
    const data = await createNewClient(req.body);
    res.status(201).json({ success: true, data });
}