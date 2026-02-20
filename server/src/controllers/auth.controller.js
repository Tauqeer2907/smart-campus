const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// POST /api/auth/register
const register = async (req, res) => {
    try {
        const { name, email, password, role, studentId, facultyId, branch, year, semester, cgpa } = req.body;

        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });

        const user = await User.create({
            name, email, password, role,
            studentId, facultyId,
            branch, year, semester, cgpa,
            avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${email}`,
        });

        res.status(201).json({
            success: true,
            message: 'Account created successfully',
            token: generateToken(user._id),
            user: user.toJSON(),
        });
    } catch (error) {
        console.error('[Auth Register]:', error.message);
        res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
    }
};

// POST /api/auth/login
const login = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        const user = await User.findOne({ email, role }).select('+password');
        if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials or role mismatch' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

        res.json({
            success: true,
            message: 'Login successful',
            token: generateToken(user._id),
            user: user.toJSON(),
        });
    } catch (error) {
        console.error('[Auth Login]:', error.message);
        res.status(500).json({ success: false, message: 'Login failed', error: error.message });
    }
};

// GET /api/auth/me (get current user profile)
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { register, login, getMe };
