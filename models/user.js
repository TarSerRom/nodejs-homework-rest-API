const { Schema, model } = require("mongoose");
const Joi = require("joi");

const emailReguirement = /^\w+([\.-]?\w+)+@\w+([\.:]?\w+)+(\.[a-zA-Z0-9]{2,3})+$/;

const userSchenma = Schema (
    {
        password: {
          type: String,
          required: [true, 'Password is required'],
        },
        email: {
          type: String,
          required: [true, 'Email is required'],
          unique: true,
        },
        subscription: {
          type: String,
          enum: ["starter", "pro", "business"],
          default: "starter"
        },
        token: {
          type: String,
          default: null,
        },
        avatarURL: {
          type: String,
          default:"",
        }
      },
      { versionKey: false, timestamps: true }
);

const joiRegisterSchema = Joi.object({
    email: Joi.string().pattern(emailReguirement).required(),
    password: Joi.string().min(6).required(),
    subscription: Joi.string().valid("starter", "pro", "business"),
});

const joiLoginSchema = Joi.object({
    email: Joi.string().pattern(emailReguirement).required(),
    password: Joi.string().min(6).required(),
});

const joiUpdateSchema = Joi.object({
    subscription: Joi.string().valid("starter", "pro", "business"),
});

const User = model("user", userSchenma);

module.exports = {User, joiLoginSchema, joiRegisterSchema, joiUpdateSchema};
