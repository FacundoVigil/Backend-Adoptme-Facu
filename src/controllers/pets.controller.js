import PetDTO from "../dto/Pet.dto.js";
import { petsService } from "../services/index.js"
import __dirname from "../utils/index.js";

const getAllPets = async (req, res) => {
    const pets = await petsService.getAll();
    res.send({ status: "success", payload: pets });
}

const createPet = async (req, res) => {
    const { name, specie, birthDate } = req.body;
    if (!name || !specie || !birthDate) return res.status(400).send({ status: "error", error: "Incomplete values" });
    const pet = PetDTO.getPetInputFrom({ name, specie, birthDate });
    const result = await petsService.create(pet);
    res.send({ status: "success", payload: result });
}

const updatePet = async (req, res) => {
    const petId = req.params.pid;
    const updateBody = req.body;
    const exists = await petsService.getBy({ _id: petId });
    if (!exists) return res.status(404).send({ status: "error", error: "Pet not found" });
    await petsService.update(petId, updateBody);
    res.send({ status: "success", message: "pet updated" });
}

const deletePet = async (req, res) => {
    const petId = req.params.pid;
    const exists = await petsService.getBy({ _id: petId });
    if (!exists) return res.status(404).send({ status: "error", error: "Pet not found" });
    await petsService.delete(petId);
    res.send({ status: "success", message: "pet deleted" });
}

const createPetWithImage = async (req, res) => {
    const file = req.file;
    const { name, specie, birthDate } = req.body;
    if (!file) return res.status(400).send({ status: "error", error: "Image is required" });
    if (!name || !specie || !birthDate) return res.status(400).send({ status: "error", error: "Incomplete values" });

    const pet = PetDTO.getPetInputFrom({
        name,
        specie,
        birthDate,
        image: `${__dirname}/../public/img/${file.filename}`
    });

    const result = await petsService.create(pet);
    res.send({ status: "success", payload: result });
}

export default { getAllPets, createPet, updatePet, deletePet, createPetWithImage }
