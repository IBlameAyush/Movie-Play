import { validate, movieSchema, movieUpdateSchema } from "../7166_middleware/7166_validate.js";
import express from "express";
import mongoose from "mongoose";
import Movie from "../7166_models/7166_Movie.js";
import authenticateUser from "../7166_middleware/7166_auth.js";
import requireAdmin from "../7166_middleware/7166_admin.js";

const router = express.Router();

// Only allow editable movie fields; never accept arbitrary document fields.
const allowedFields = [
  "title",
  "description",
  "genre",
  "releaseYear",
  "posterUrl",
  "backdropUrl",
  "videoUrl",
  "rating",
  "featured",
];

function getMovieFields(body) {
  const fields = {};

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      fields[field] = body[field];
    }
  }

  return fields;
}

// Get all movies, with optional search and genre filters
router.get("/", async (req, res) => {
  try {
    const { search, genre } = req.query;
    const filter = {};

    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }

    if (genre) {
      filter.genre = genre;
    }

    const movies = await Movie.find(filter).sort({ createdAt: -1 });

    res.json({ success: true, count: movies.length, movies });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to retrieve movies",
    });
  }
});

// Get one movie by ID
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid movie ID",
      });
    }

    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }

    res.json({ success: true, movie });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to retrieve movie",
    });
  }
});

// Create movie — admin only
router.post("/", authenticateUser, requireAdmin, validate(movieSchema), async (req, res) => {
  try {
    const movieData = getMovieFields(req.body);
    const movie = await Movie.create(movieData);

    res.status(201).json({
      success: true,
      message: "Movie created successfully",
      movie,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.name === "ValidationError"
        ? error.message
        : "Unable to create movie",
    });
  }
});

// Update movie — admin only
router.put("/:id", authenticateUser, requireAdmin, validate(movieUpdateSchema, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid movie ID",
      });
    }

    const movieData = getMovieFields(req.body);

    if (Object.keys(movieData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No editable movie fields provided",
      });
    }

    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      { $set: movieData },
      { returnDocument: "after", runValidators: true }
    );

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }

    res.json({
      success: true,
      message: "Movie updated successfully",
      movie,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.name === "ValidationError"
        ? error.message
        : "Unable to update movie",
    });
  }
}));

// Delete movie — admin only
router.delete("/:id", authenticateUser, requireAdmin, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid movie ID",
      });
    }

    const movie = await Movie.findByIdAndDelete(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }

    res.json({
      success: true,
      message: "Movie deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to delete movie",
    });
  }
});

export default router;
