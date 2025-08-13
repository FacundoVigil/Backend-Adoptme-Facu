
import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const HASHED_PASSWORD = bcrypt.hashSync('coder123', 10);

export const generateUser = () => ({
  
  _id: new mongoose.Types.ObjectId(),
  first_name: faker.person.firstName(),
  last_name: faker.person.lastName(),
  email: faker.internet.email().toLowerCase(),
  password: HASHED_PASSWORD,
  role: faker.helpers.arrayElement(['user', 'admin']),

  pets: [],
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const generateUsers = (n = 50) =>
  Array.from({ length: n }, () => generateUser());


export const generatePet = () => ({
  _id: new mongoose.Types.ObjectId(),
  name: faker.animal.petName(),
  species: faker.helpers.arrayElement(['dog', 'cat', 'bird', 'other']),
  adopted: Math.random() < 0.2,
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const generatePets = (n = 50) =>
  Array.from({ length: n }, () => generatePet());
