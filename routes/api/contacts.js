const express = require("express");
const Joi = require("@hapi/joi");
const {
  listContacts,
  getContactById,
  addContact,
  removeContact,
  updateContact,
} = require("../../models/contacts");

const schema = Joi.object({
  name: Joi.string().min(6).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().min(6).required(),
});

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const contacts = await listContacts();
    res.json(contacts);
  } catch (error) {
    next(error);
  }
});

router.get("/:contactId", async (req, res, next) => {
  try {
    const contact = await getContactById(req.params.id);
    if (contact) {
      res.json(contact);
    } else {
      res.status(404).json({ message: "Not found" });
    }
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const validatedBody = schema.validate(req.body);
    if (validatedBody.error) {
      res.status(400).json({
        message: `missing required ${validatedBody.error.details[0].path} - field`,
      });
    } else {
      const result = await addContact(req.body);
      res.json(result);
    }
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const contact = await removeContact(req.params.id);
    if (contact) {
      res.json({ message: "Contact deleted" });
    } else {
      res.status(400).json({ message: "Not found" });
    }
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    if (req.body) {
      const update = await updateContact(req.params.id, req.body);
      if (update) {
        res.json(update);
      } else {
        res.status(404).json({ message: "Not found" });
      }
    } else {
      res.status(400).json({ message: "missing fields" });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
