const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.register = async (req, res) => {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({ name, email, password_hash: hashedPassword });
    res.json({ message: "User registered successfully", user });
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ 
        token,
        userId: user._id // Add userId to the response
    });
};