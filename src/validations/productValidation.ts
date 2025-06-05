import Joi from "joi";

export const productValidationSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  description: Joi.string().min(10).max(500).required(),
  price: Joi.number().positive().required(),
  category: Joi.string().valid("electronics", "clothing", "books").required(),
});
