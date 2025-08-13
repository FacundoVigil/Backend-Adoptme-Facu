
import { Router } from 'express';
import { generateUsers, generatePets } from '../utils/mocking.js';


import userModel from '../dao/models/Users.js'; 
import petModel from '../dao/models/Pets.js';   

const router = Router();

router.get('/mockingusers', (req, res) => {
  const count = Number.parseInt(req.query.count) || 50;
  const users = generateUsers(count);
  return res.status(200).json({ status: 'success', payload: users });
});

router.get('/mockingpets', (req, res) => {
  const count = Number.parseInt(req.query.count) || 100;
  const pets = generatePets(count);
  return res.status(200).json({ status: 'success', payload: pets });
});

router.post('/generateData', async (req, res) => {
  try {
    const usersQty = Number.isFinite(req.body?.users) ? Number(req.body.users) : 0;
    const petsQty  = Number.isFinite(req.body?.pets)  ? Number(req.body.pets)  : 0;

    if (usersQty < 0 || petsQty < 0)
      return res.status(400).json({ status: 'error', error: 'users/pets deben ser >= 0' });

    if (usersQty > 1000 || petsQty > 1000)
      return res.status(400).json({ status: 'error', error: 'Límite 1000 por tipo' });

    const usersData = usersQty ? generateUsers(usersQty) : [];
    const petsData  = petsQty  ? generatePets(petsQty)   : [];


    const [usersResult, petsResult] = await Promise.all([
      usersData.length ? userModel.insertMany(usersData, { ordered: false }) : Promise.resolve([]),
      petsData.length  ? petModel.insertMany(petsData,   { ordered: false }) : Promise.resolve([]),
    ]);

    return res.status(201).json({
      status: 'success',
      inserted: {
        users: Array.isArray(usersResult) ? usersResult.length : 0,
        pets:  Array.isArray(petsResult)  ? petsResult.length  : 0
      },
    });
  } catch (err) {
    console.error('generateData error', err);
    return res.status(500).json({ status: 'error', error: err.message });
  }
});

export default router;
