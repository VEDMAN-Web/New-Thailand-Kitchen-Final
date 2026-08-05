"use client";

import HomeContactInput from "../contactUs/HomeContactInput";
import useContact from "../../hooks/useContact";
import { useTranslation } from "../../i18n/LanguageProvider";

export default function ProductDetailContactForm() {
  const { t } = useTranslation();
  const { formData, errors, loading, handleChange, handleSubmit } =
    useContact();

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-7"
    >
      <HomeContactInput
        label={t("form.fullName")}
        name="fullName"
        value={formData.fullName}
        onChange={handleChange}
        error={errors.fullName}
      />

      <HomeContactInput
        label={t("form.email")}
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
      />

      <div className="sm:col-span-2">
        <HomeContactInput
          label={t("form.phoneWhatsapp")}
          name="phoneNumber"
          type="tel"
          value={formData.phoneNumber}
          onChange={handleChange}
          error={errors.phoneNumber}
        />
      </div>

      <div className="sm:col-span-2 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 bg-[#1A1A1A] text-white px-8 py-3.5 rounded-full text-sm font-semibold hover:bg-black transition disabled:opacity-70"
        >
          {loading ? t("form.sending") : t("form.submit")}
          {!loading && <span aria-hidden>↗</span>}
        </button>
      </div>
    </form>
  );
}
