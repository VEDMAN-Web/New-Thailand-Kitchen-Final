"use client";

import { useState } from "react";
import { ContactData } from "../types/contactUs";
import { createContact } from "../services/contactAPI";
import { validateContact } from "../utils/validation";
import { toast } from "sonner";
import { useTranslation } from "../i18n/LanguageProvider";

const initialData: ContactData = {
  fullName: "",
  email: "",
  whatsappNumber: "",
  phoneNumber: "",
  cityName: "",
  countryName: "",
  message: "",
};

export default function useContact() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState(initialData);

  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState<
    Partial<Record<keyof ContactData, string>>
  >({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    const nextValue =
      name === "phoneNumber" || name === "whatsappNumber"
        ? value.replace(/[^\d+]/g, "").replace(/(?!^)\+/g, "")
        : name === "fullName" || name === "countryName" || name === "cityName"
          ? value.replace(/[^\p{L}\s'.-]/gu, "")
          : value;

    setFormData((prev) => ({
      ...prev,
      [name]: nextValue,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const phone = formData.phoneNumber.trim();
    const payload: ContactData = {
      ...formData,
      phoneNumber: phone,
      // Forms no longer collect these; keep API/DB contracts intact.
      whatsappNumber: phone,
      cityName: "Not provided",
      countryName: "Not provided",
      message:
        formData.message.trim() ||
        `Contact page inquiry from ${formData.fullName || "visitor"}. Please follow up regarding kitchen consultation.`,
    };

    const validationErrors = validateContact(payload);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);

      await createContact(payload);

      // Unlock catalogue PDF download (httpOnly cookie via Next API)
      try {
        await fetch("/api/catalog/unlock", { method: "POST" });
      } catch {
        /* unlock is best-effort; contact already saved */
      }

      toast.success(t("form.successTitle"), {
        description: t("form.successDescCatalog"),
      });

      setFormData(initialData);

      setErrors({});

      // Soft-refresh catalog lock UI if user stays on page
      window.dispatchEvent(new Event("catalog:unlocked"));
    } catch (err: unknown) {
      const apiMessage =
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof (err as { response?: { data?: { message?: string } } }).response
          ?.data?.message === "string"
          ? (err as { response: { data: { message: string } } }).response.data
              .message
          : err instanceof Error
            ? err.message
            : t("form.errorDesc");

      toast.error(t("form.errorTitle"), {
        description: apiMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    errors,
    loading,
    handleChange,
    handleSubmit,
  };
}
