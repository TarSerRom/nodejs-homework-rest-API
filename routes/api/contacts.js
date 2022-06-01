const express = require('express')
const router = express.Router()
const { NotFound, BadRequest } = require("http-errors");

const {Contact, joiSchema} = require("../..//models/contacts")

router.get("/", async (req, res, next) => {
  try {
    const contacts = await Contact.find();
    res.json(contacts);
  } catch (e) {
    next(e);
  }
});

router.get("/:contactId", async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const contact = await Contact.findById(contactId);
    if (!contact) {
      throw new NotFound();
    }
    res.json(contact);
  } catch (e) {
    if (e.message.includes("Cast to ObjectId failed")) {
      e.status = 404;
    }
    next(e);
  }
});

router.post('/', async (req, res, next) => {
  try{
    const {error} = joiSchema.validate(req.body)
    if(error) {
      throw new BadRequest("missing required name field");
    }
    const newContact = await Contact.create(req.body);
    res.status(201).json(newContact);
  } catch(e) {
    if(e.message.includes("validation failed")) {
      e.status = 400;
    }
    next(e);
  }
});

router.delete("/:contactId", async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const deleteContact = await Contact.findByIdAndRemove(contactId);
    if (!deleteContact) {
      throw new NotFound();
    }
    res.json("message: contact deleted");
  } catch (e) {
    next(e);
  }
});

router.put('/:contactId', async (req, res, next) => {
  try {
    const { error } = joiSchema.validate(req.body);
    if (error) {
      error.status = 400;
      throw error;
    }
    const {contactId} = req.params;
    const updateContact = await Contact.findByIdAndUpdate(contactId, req.body, {new:true});
    res.json(updateContact);
  } catch(e){
    if(e.message.includes("validation failed")) {
      e.status = 400;
    }
    next(e);
  }
});

router.patch("/:contactId/favorite", async (req, res, next) => {
  try {
    const {contactId} = req.params;
    const {favorite = false} = req.body;
    const updateContact = await Contact.findByIdAndUpdate(contactId, {favorite}, {new:true});
    res.json(updateContact);
  } catch(e) {
    if(e.message.includes("validation failed")) {
      e.status = 400;
    }
    next(e);
  }
});


module.exports = router;
