import { usersService } from "../services/index.js";
import { createHash, passwordValidation } from "../utils/index.js";
import jwt from 'jsonwebtoken';
import UserDTO from '../dto/User.dto.js';

const JWT_SECRET = process.env.JWT_SECRET || 'tokenSecretJWT';

const register = async (req, res) => {
    try {
        const { first_name, last_name, email, password } = req.body;
        if (!first_name || !last_name || !email || !password)
            return res.status(400).send({ status: "error", error: "Incomplete values" });

        const exists = await usersService.getUserByEmail(email);
        if (exists) return res.status(400).send({ status: "error", error: "User already exists" });

        const hashedPassword = await createHash(password);
        const user = { first_name, last_name, email, password: hashedPassword, role: 'user' };
        const result = await usersService.create(user);

        return res.status(201).send({ status: "success", payload: result._id });
    } catch (error) {
        return res.status(500).send({ status: "error", error: error.message });
    }
}

const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).send({ status: "error", error: "Incomplete values" });

    const user = await usersService.getUserByEmail(email);
    if (!user) return res.status(400).send({ status: "error", error: "Incorrect credentials" });

    const isValid = await passwordValidation(user, password);
    if (!isValid) return res.status(400).send({ status: "error", error: "Incorrect credentials" });

    const tokenPayload = UserDTO.getUserTokenFrom(user);
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1d' });

    res.cookie('authToken', token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000,
    });

    return res.send({ status: "success" });
}

const current = (req, res) => {
    try {
        const token = req.cookies['authToken'];
        if (!token) return res.status(401).send({ status: "error", error: "No token" });
        const user = jwt.verify(token, JWT_SECRET);
        return res.send({ status: "success", payload: user });
    } catch {
        return res.status(401).send({ status: "error", error: "Invalid token" });
    }
}

const unprotectedLogin = (req, res) => {
    const token = jwt.sign({ name: 'Guest', email: 'guest@example.com', role: 'user' }, JWT_SECRET, { expiresIn: '1d' });
    res.cookie('unprotectedCookie', token, { httpOnly: false, sameSite: 'lax', maxAge: 24 * 60 * 60 * 1000 });
    return res.send({ status: "success" });
}

const unprotectedCurrent = (req, res) => {
    try {
        const cookie = req.cookies['unprotectedCookie'];
        if (!cookie) return res.status(401).send({ status: "error", error: "No cookie" });
        const user = jwt.verify(cookie, JWT_SECRET);
        return res.send({ status: "success", payload: user });
    } catch {
        return res.status(401).send({ status: "error", error: "Invalid token" });
    }
}

export default { register, login, current, unprotectedLogin, unprotectedCurrent }
