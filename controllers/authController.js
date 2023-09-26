import bcrypt from "bcrypt";
import Jwt from "jsonwebtoken";
import User from "../models/User.js";
import Appointment from "../models/Appointment.js";

/* CREATE USER */
//REGISTRATION IS WORKING
export const register = async (req, res) => {
  try {
    const { name, phoneNumber, email, password } = req.body;
    //encryption for password
    const salt = await bcrypt.genSalt();
    //generate random password and save it into database
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      phoneNumber,
      email,
      password: passwordHash,
    });
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* LOGGING IN NORMALLY */
//LOGGING IN WORKS
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) return res.status(400).json({ msg: "User does not exist." });

    const isMatch = bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials. " });

    const token = Jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    delete user.password;
    res.status(200).json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* LOGGING IN WITH LINK */
export const linkLogin = async (req, res) => {
  try {
    const { pass, id } = req.body;
    const appointment = await Appointment.findOne({ id: id });
    if ((appointment.status = "complete"))
      return res
        .status(400)
        .json({ msg: "This appointment has been completed" });

    const token = Jwt.sign({ id: appointment._id }, process.env.JWT_SECRET);
    res.status(200).json({ token, appointment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
