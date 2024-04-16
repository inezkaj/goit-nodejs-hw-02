const express = require("express");
const Contact = require("../../models/contact.js");
// const Joi = require("@hapi/joi");
const {
  listContacts,
  getContactById,
  addContact,
  removeContact,
  updateContact,
  updateStatusContact,
} = require("../../models/contacts");

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
    const contact = await getContactById(req.params.contactId);
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
    const validatedBody = Contact.validate(req.body);
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

router.delete("/:contactId", async (req, res, next) => {
  try {
    const contact = await removeContact(req.params.contactId);
    if (contact) {
      res.json({ message: "Contact deleted" });
    } else {
      res.status(400).json({ message: "Not found" });
    }
  } catch (error) {
    next(error);
  }
});

router.put("/:contactId", async (req, res, next) => {
  try {
    if (req.body) {
      const update = await updateContact(req.params.contactId, req.body);
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

router.patch("/:id/favorite", async (req, res, next) => {
  try {
    if (req.body && req.body.favorite !== undefined) {
      const updateNew = await updateStatusContact(req.params.id, req.body);
      if (updateNew) {
        res.json(updateNew);
      } else {
        res.status(404).json({ message: "Not found" });
      }
    } else {
      res.status(400).json({ message: "missing field favorite" });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
