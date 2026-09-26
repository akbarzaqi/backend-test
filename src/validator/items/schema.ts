import Joi from "joi";

const CreateItemSchema = Joi.object({
    userId: Joi.number().integer().required(),
    name: Joi.string().required(),
    description: Joi.string().required(),
    stock: Joi.number().integer().min(0).required(),
    price: Joi.number().precision(2).min(0).required(),
});

export { CreateItemSchema };