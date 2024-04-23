const User = require("./user.js");

const listContacts = async () => {
  return User.find();
};

const getContactById = async (id) => {
  return User.findOne({ _id: id });
};

const removeContact = async (id) => {
  return User.findByIdAndDelete({ _id: id });
};

const addContact = async ({ name, email, phone, favorite }) => {
  return User.create({ name, email, phone, favorite });
};

const updateContact = async (id, body) => {
  return User.findByIdAndUpdate(id, { body }, { new: true });
};

const updateStatusContact = async (id, favorite) => {
  return User.findByIdAndUpdate(id, { favorite: !!favorite }, { new: true });
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateStatusContact,
};
