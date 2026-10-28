
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../7166_models/7166_User.js";
import authenticateUser from "../7166_middleware/7166_auth.js";
import Movie from "../7166_models/7166_Movie.js";
import {
  validate,
  registerSchema,
  loginSchema,
} from "../7166_middleware/7166_validate.js";

const router = express.Router();

function createToken(userId) {
  return jwt.sign(
    { userId: userId.toString() },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function setTokenCookie(res, token) {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

// Register
router.post("/register", validate(registerSchema), async(req, res) => {
  try {
    const { name, email, password } = req.body;

    if (
      !name?.trim() ||
      !email?.trim() ||
      typeof password !== "string" ||
      password.length < 8
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter your name, email and a password of at least 8 characters.",
      });
    }

    if (password.length > 72) {
      return res.status(400).json({
        success: false,
        message: "Password must be 72 characters or fewer.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    setTokenCookie(res, createToken(user._id));

    res.status(201).json({
      success: true,
      message: "Account created successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    console.error("Registration error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to create account.",
    });
  }
});

// Login
router.post("/login", validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter your email and password.",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+password");

    if (
      !user ||
      !(await bcrypt.compare(password, user.password))
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    setTokenCookie(res, createToken(user._id));

    res.json({
      success: true,
      message: "Login successful.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to log in.",
    });
  }
});

// Check current session
router.get("/me", authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account not found.",
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Unable to retrieve your account.",
    });
  }
});

// Logout
router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  res.json({
    success: true,
    message: "Logged out successfully.",
  });
});


/* Get the logged-in user's watchlist */
router.get("/watchlist", authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate("watchlist");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.json({
      success: true,
      movies: user.watchlist.filter(Boolean),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to load watchlist.",
    });
  }
});

/* Add a movie to the watchlist */
router.post("/watchlist/:movieId", authenticateUser, async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.movieId);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found.",
      });
    }

    await User.findByIdAndUpdate(req.userId, {
      $addToSet: { watchlist: movie._id },
    });

    res.json({
      success: true,
      message: "Movie added to your library.",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Unable to add movie to watchlist.",
    });
  }
});

/* Remove a movie from the watchlist */
router.delete(
  "/watchlist/:movieId",
  authenticateUser,
  async (req, res) => {
    try {
      await User.findByIdAndUpdate(req.userId, {
        $pull: { watchlist: req.params.movieId },
      });

      res.json({
        success: true,
        message: "Movie removed from your library.",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Unable to remove movie from watchlist.",
      });
    }
  }
);
// in authRoutes.js



export default router;
