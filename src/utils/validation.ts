import { ContactData } from "../types/contactUs";

const lettersOnlyPattern = /^[\p{L}\s'.-]+$/u;

export const validateContact = (data: ContactData) => {
  const errors: Partial<Record<keyof ContactData, string>> = {};

  if (!data.fullName.trim()) {
    errors.fullName = "Full name is required";
  } else if (!lettersOnlyPattern.test(data.fullName.trim())) {
    errors.fullName = "Full name must contain only letters";
  }

  if (!data.email.trim()) {
    errors.email = "Email is required";
  } else if (
    !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(data.email)
  ) {
    errors.email = "Invalid email address";
  }

  if (!data.phoneNumber.trim()) {
    errors.phoneNumber = "Phone number is required";
  } else if (!/^\+?[0-9]+$/.test(data.phoneNumber.trim())) {
    errors.phoneNumber = "Phone number must contain only numbers";
  }

  if (!data.whatsappNumber.trim()) {
    errors.whatsappNumber = "WhatsApp number is required";
  } else if (!/^\+?[0-9]+$/.test(data.whatsappNumber.trim())) {
    errors.whatsappNumber = "WhatsApp number must contain only numbers";
  }

  if (!data.cityName.trim()) {
    errors.cityName = "City is required";
  } else if (!lettersOnlyPattern.test(data.cityName.trim())) {
    errors.cityName = "City must contain only letters";
  }

  if (!data.countryName.trim()) {
    errors.countryName = "Country is required";
  } else if (!lettersOnlyPattern.test(data.countryName.trim())) {
    errors.countryName = "Country must contain only letters";
  }

  if (!data.message.trim()) {
    errors.message = "Please enter your message.";
  } else if (data.message.length < 20) {
    errors.message =
      "Message must be at least 20 characters.";
  }

  return errors;
};