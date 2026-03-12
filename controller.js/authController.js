import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/* REGISTER */
export const register = async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;

    /* VALIDATIONS */
    if (!/^[A-Za-z ]{2,}$/.test(name))
      return res.status(400).json({ message: "Invalid name" });

    if (!/^[0-9]{12}$/.test(phone))
      return res.status(400).json({ message: "Phone must be 12 digits" });

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return res.status(400).json({ message: "Invalid email" });

    if (
      !/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(password)
    )
      return res.status(400).json({
        message:
          "Password must have 1 capital, 1 number, 1 special & min 8 chars",
      });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);

    await User.create({
      name,
      phone,
      email,
      password: hashed,
    });

    res.status(201).json({ message: "Registration successful" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/* LOGIN */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Account does not exist" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ message: "Incorrect password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({ message: "Login successful", token });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};