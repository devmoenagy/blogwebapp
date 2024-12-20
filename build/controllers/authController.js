"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.loginUser = exports.registerUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
// Register User
const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, firstName, lastName, email, password } = req.body;
    try {
        // Check if the username already exists
        const existingUsername = yield User_1.default.findOne({ username });
        if (existingUsername) {
            res.status(400).json({ error: "Username already taken" });
            return;
        }
        // Check if the email already exists
        const existingEmail = yield User_1.default.findOne({ email });
        if (existingEmail) {
            res.status(400).json({ error: "Email already registered" });
            return;
        }
        // Hash the password before saving to the database
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        // Create a new user instance and save to the database
        const newUser = new User_1.default({
            username,
            firstName,
            lastName,
            email,
            password: hashedPassword,
        });
        yield newUser.save();
        res.status(201).json({ message: "User registered successfully" });
    }
    catch (error) {
        console.error("Error during user registration:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.registerUser = registerUser;
// Login User
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { usernameOrEmail, password } = req.body;
    try {
        // Find user by either username or email
        const user = yield User_1.default.findOne({
            $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
        });
        if (!user) {
            res.status(401).json({ error: "Invalid credentials" });
            return;
        }
        // Compare the provided password with the stored hashed password
        const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({ error: "Invalid credentials" });
            return;
        }
        // Generate a JWT token
        const token = jsonwebtoken_1.default.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });
        res.status(200).json({
            token,
            user: {
                username: user.username,
                email: user.email,
            },
        });
    }
    catch (error) {
        console.error("Error during user login:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.loginUser = loginUser;
// Update User Profile
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { firstName, lastName, email } = req.body;
    const userId = req.userId; // Use the userId from the AuthenticatedRequest
    if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
        return;
    }
    try {
        // Find the user by ID and update their profile information
        const user = yield User_1.default.findByIdAndUpdate(userId, { firstName, lastName, email }, { new: true, runValidators: true } // Return the updated user and run validators
        );
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        res.status(200).json({ message: "Profile updated successfully" });
    }
    catch (error) {
        console.error("Error during profile update:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.updateProfile = updateProfile;
