const nodemailer = require("nodemailer");
require('dotenv').config();

const { MY_EMAIL, GOOGLE_APP_PASSWORD } = process.env;

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  secure: true,
  auth: {
    user: MY_EMAIL,
    pass: GOOGLE_APP_PASSWORD,
  },
})

const sendEmail = async (data) => {
  const email = { ...data, from: MY_EMAIL }
    try {
    await transporter.sendMail(email);
    return true;
  } catch (error) {
    throw error;
  }
};

module.exports = sendEmail;


/*const sgMail = require("@sendgrid/mail");
require("dotenv").config();

const {SENDGRID_API_KEY, MY_EMAIL} = process.env;

sgMail.setApiKey(SENDGRID_API_KEY);

const sendEmail = async(data) => {
    try {
        const email = {...data, from: MY_EMAIL};
        await sgMail.send(email);
        return true;
    } catch (error) {
        throw error;
    }
};

module.exports = sendEmail;*/