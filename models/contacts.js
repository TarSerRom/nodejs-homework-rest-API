const {Schema, model} = require('mongoose');
const Joi = require('joi');

const contactSchema = new Schema(
  {
    name: {
        type: String,
        required: [true, 'Set name for contact'],
    },
    email: {
        type: String,
        required: [true, 'Set email for contact'],
        unique: true,
    },
    phone: {
        type: String,
        required: [true, 'Set phone for contact'],
        unique: true,
    },
    favorite: {
        type: Boolean,
        default: false,
    },
},
{
  versionKey: false,
  timestamps: true,
},

);

const joiSchema = Joi.object({
    name: Joi.string().min(2).required(),
    email: Joi.string().required(),
    phone: Joi.string().required(),
    favorite: Joi.bool,
  });

const Contact = model('contact', contactSchema);

module.exports = {Contact,joiSchema};