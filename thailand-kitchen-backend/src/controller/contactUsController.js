const Contact = require("../model/contactUsModel");
const asyncHandler = require("../utils/asyncHandler");


const createContact = asyncHandler(async (req, res) => {
  const {
    fullName,
    email,
    whatsappNumber,
    phoneNumber,
    cityName,
    countryName,
    message,
  } = req.body;

  const contact = await Contact.create({
    fullName,
    email,
    whatsappNumber,
    phoneNumber,
    cityName,
    countryName,
    message,
  });

  res.status(201).json({
    success: true,
    message: "Contact submitted successfully",
    data: contact,
  });
});


const getContacts = asyncHandler(async (req, res) => {
  const contacts = await Contact.find({
    fullName: { $exists: true, $ne: "" },
    email: { $exists: true, $ne: "" },
  }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: contacts.length,
    data: contacts,
  });
});


const getContactById = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    return res.status(404).json({
      success: false,
      message: "Contact not found",
    });
  }

  res.status(200).json({
    success: true,
    data: contact,
  });
});


const updateContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!contact) {
    return res.status(404).json({
      success: false,
      message: "Contact not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Contact updated successfully",
    data: contact,
  });
});


const deleteContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    return res.status(404).json({
      success: false,
      message: "Contact not found",
    });
  }

  await contact.deleteOne();

  res.status(200).json({
    success: true,
    message: "Contact deleted successfully",
  });
});


module.exports = {
  createContact,
  getContacts,
  getContactById,
  updateContact,
  deleteContact
};