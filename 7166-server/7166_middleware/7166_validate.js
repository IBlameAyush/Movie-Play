import Joi from "joi";

export const registerSchema = Joi.object({
  name: Joi.string().trim().max(60).required(),
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().min(8).max(72).required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().max(72).required(),
});

export const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body ?? {}, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details.map((d) => d.message).join(", "),
    });
  }

  req.body = value; // cleaned data (trimmed, unknown fields removed)
  next();
};

export const movieSchema = Joi.object({
  title: Joi.string().trim().required(),
  description: Joi.string().required(),
  genre: Joi.array().items(Joi.string().trim()).min(1).required(),
  releaseYear: Joi.number().integer().min(1888).max(new Date().getFullYear() + 1).required(),
  posterUrl: Joi.string().uri({ scheme: ["http", "https"] }).allow(""),
  backdropUrl: Joi.string().uri({ scheme: ["http", "https"] }).allow(""),
  videoUrl: Joi.string().uri({ scheme: ["http", "https"] }).allow(""),
  rating: Joi.number().min(0).max(10),
  featured: Joi.boolean(),
});

// For PUT, make every field optional but require at least one
export const movieUpdateSchema = movieSchema.fork(
  Object.keys(movieSchema.describe().keys),
  (field) => field.optional()
).min(1);