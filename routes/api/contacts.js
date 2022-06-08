const express = require("express");
const router = express.Router();
const { NotFound, BadRequest } = require("http-errors");

const {Contact, joiSchema} = require("../..//models/contacts");
const {authentificate} = require("../../middlewares");

router.get("/", authentificate, async (req, res, next) => {
  try {
    const { _id } = req.user;
    const contacts = await Contact.find(
      { owner: _id },
      "-createdAt -updatedAt",
    );
    res.json(contacts);
  } catch (e) {
    next(e);
  }
});

router.get("/:contactId", authentificate, async (req, res, next) => {
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

router.post('/', authentificate, async (req, res, next) => {
  try{
    const {error} = joiSchema.validate(req.body)
    if(error) {
      throw new BadRequest("missing required name field");
    }
    const {_id} = req.user;
    const newContact = await Contact.create({...req.body, owner: _id});
    res.status(201).json(newContact);
  } catch(e) {
    if(e.message.includes("validation failed")) {
      e.status = 400;
    }
    next(e);
  }
});

router.delete("/:contactId", authentificate, async (req, res, next) => {
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

router.put('/:contactId', authentificate, async (req, res, next) => {
  try {
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

router.patch("/:contactId/favorite", authentificate, async (req, res, next) => {
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
