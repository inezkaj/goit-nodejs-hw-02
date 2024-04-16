const Contact = require("./contact.js");

const listContacts = async () => {
  return Contact.find();
};

const getContactById = async (id) => {
  return Contact.findOne({ _id: id });
};

const removeContact = async (id) => {
  return Contact.findByIdAndDelete({ _id: id });
};

const addContact = async ({ name, email, phone, favorite }) => {
  return Contact.create({ name, email, phone, favorite });
};

const updateContact = async (id, body) => {
  return Contact.findByIdAndUpdate(id, { body }, { new: true });
};

const updateStatusContact = async (id, favorite) => {
  return Contact.findByIdAndUpdate(id, { favorite: !!favorite }, { new: true });
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateStatusContact,
};
