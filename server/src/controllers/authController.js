import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';

// Simple email regex for controller-level validation
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * @desc    Register a new student
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req, res, next) => {
  try {
    let { fullName, collegeId, email, password, department, role, adminSecret } = req.body;

    // Validate presence of required fields
    if (!fullName || !collegeId || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: fullName, collegeId, email, and password',
      });
    }

    // Sanitize and normalize inputs
    fullName = fullName.trim();
    collegeId = collegeId.trim().toUpperCase();
    email = email.trim().toLowerCase();
    department = (department || 'General Engineering').trim();

    // Determine requested role
    let assignedRole = 'student';
    let initialPoints = 50;

    if (role === 'admin') {
      const serverAdminSecret = process.env.ADMIN_REGISTRATION_SECRET || 'ECOPULSE_ADMIN_2026';
      if (!adminSecret || adminSecret.trim() !== serverAdminSecret) {
        return res.status(403).json({
          success: false,
          message: 'Invalid Campus Admin Secret Passcode. Access denied.',
        });
      }
      assignedRole = 'admin';
      initialPoints = 0; // Administrators manage events and do not start with student eco-points
    }

    // Validate full name length
    if (fullName.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Full name must be at least 2 characters long',
      });
    }

    // Validate email format
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email format (e.g., student@college.edu)',
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    // Check for duplicate email
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists',
      });
    }

    // Check for duplicate collegeId
    const existingCollegeId = await User.findOne({ collegeId });
    if (existingCollegeId) {
      return res.status(400).json({
        success: false,
        message: 'An account with this College ID already exists',
      });
    }

    // Hash password with bcryptjs
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user account
    const user = await User.create({
      fullName,
      collegeId,
      email,
      passwordHash,
      department,
      role: assignedRole,
      ecoPoints: initialPoints,
    });

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: `${assignedRole === 'admin' ? 'Administrator' : 'Student'} account registered successfully`,
      token,
      user: user.toSafeObject(),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Authenticate student & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req, res, next) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    email = email.trim().toLowerCase();

    // Explicitly select passwordHash which is hidden by default
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = generateToken(user);

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: user.toSafeObject(),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get current student profile
 * @route   GET /api/auth/profile
 * @access  Private (JWT protected)
 */
export const getUserProfile = async (req, res, next) => {
  try {
    // req.user is already populated by protect middleware
    return res.json({
      success: true,
      user: req.user.toSafeObject(),
    });
  } catch (err) {
    next(err);
  }
};
