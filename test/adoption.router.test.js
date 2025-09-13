import mongoose from 'mongoose';
import request from 'supertest';
import { expect } from 'chai';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod;
let app;
let UserModel;
let PetModel;
let AdoptionModel;

describe('Adoption Router - Functional Tests', function () {
    this.timeout(30000);

    before(async () => {
        mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();
        process.env.MONGO_URL = uri;
        process.env.DB_NAME = 'adoptme_test';
        process.env.NODE_ENV = 'test';
        process.env.JWT_SECRET = 'testsecret';

        // Conectamos Mongoose antes de importar la app (idempotente)
        await mongoose.connect(uri, { dbName: process.env.DB_NAME });

        // Importes dinámicos DESPUÉS de setear env/conn
        app = (await import('../src/app.js')).default;
        UserModel = (await import('../src/dao/models/User.js')).default;
        PetModel = (await import('../src/dao/models/Pet.js')).default;
        AdoptionModel = (await import('../src/dao/models/Adoption.js')).default;
    });

    after(async () => {
        await mongoose.disconnect();
        if (mongod) await mongod.stop();
    });

    beforeEach(async () => {
        await AdoptionModel.deleteMany({});
        await PetModel.deleteMany({});
        await UserModel.deleteMany({});
    });

    it('GET /api/adoptions should return empty array initially', async () => {
        const res = await request(app).get('/api/adoptions').expect(200);
        expect(res.body.status).to.equal('success');
        expect(res.body.payload).to.be.an('array').that.has.lengthOf(0);
    });

    it('POST /api/adoptions/:uid/:pid should 404 when user not found', async () => {
        const pet = await PetModel.create({ name: 'Puppy', specie: 'dog', birthDate: new Date() });
        const res = await request(app).post(`/api/adoptions/66f1bf2c3b8e2f0012a30000/${pet._id}`).expect(404);
        expect(res.body.status).to.equal('error');
        expect(res.body.error).to.match(/User not found/i);
    });

    it('POST /api/adoptions/:uid/:pid should 404 when pet not found', async () => {
        const user = await UserModel.create({
            first_name: 'John',
            last_name: 'Doe',
            email: 'john@example.com',
            password: 'hashed',
            role: 'user',
            pets: []
        });
        const res = await request(app).post(`/api/adoptions/${user._id}/66f1bf2c3b8e2f0012a39999`).expect(404);
        expect(res.body.status).to.equal('error');
        expect(res.body.error).to.match(/Pet not found/i);
    });

    it('POST /api/adoptions/:uid/:pid should 400 when pet already adopted', async () => {
        const user = await UserModel.create({
            first_name: 'Mary',
            last_name: 'Poe',
            email: 'mary@example.com',
            password: 'hashed',
            role: 'user',
            pets: []
        });
        const pet = await PetModel.create({ name: 'Kitty', specie: 'cat', adopted: true });
        const res = await request(app).post(`/api/adoptions/${user._id}/${pet._id}`).expect(400);
        expect(res.body.status).to.equal('error');
        expect(res.body.error).to.match(/already adopted/i);
    });

    it('POST /api/adoptions/:uid/:pid should adopt a pet (happy path) and GET endpoints should reflect it', async () => {
        const user = await UserModel.create({
            first_name: 'Ana',
            last_name: 'Smith',
            email: 'ana@example.com',
            password: 'hashed',
            role: 'user',
            pets: []
        });
        const pet = await PetModel.create({ name: 'Bobby', specie: 'dog', adopted: false });

        const postRes = await request(app).post(`/api/adoptions/${user._id}/${pet._id}`).expect(200);
        expect(postRes.body.status).to.equal('success');
        expect(postRes.body.message).to.match(/Pet adopted/i);

        // Estado en DB
        const updatedPet = await PetModel.findById(pet._id);
        expect(updatedPet.adopted).to.equal(true);
        expect(String(updatedPet.owner)).to.equal(String(user._id));

        const updatedUser = await UserModel.findById(user._id);
        const hasPet = updatedUser.pets.some(p => String(p._id) === String(pet._id));
        expect(hasPet).to.equal(true);

        // GET /
        const listRes = await request(app).get('/api/adoptions').expect(200);
        expect(listRes.body.status).to.equal('success');
        expect(listRes.body.payload).to.be.an('array').with.lengthOf(1);
        const createdAdoption = listRes.body.payload[0];

        // GET /:aid
        const detailRes = await request(app).get(`/api/adoptions/${createdAdoption._id}`).expect(200);
        expect(detailRes.body.status).to.equal('success');
        expect(String(detailRes.body.payload.owner)).to.equal(String(user._id));
        expect(String(detailRes.body.payload.pet)).to.equal(String(pet._id));
    });
});
