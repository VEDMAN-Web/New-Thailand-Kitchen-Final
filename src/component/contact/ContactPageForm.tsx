"use client";

import HomeContactInput from "../contactUs/HomeContactInput";
import useContact from "../../hooks/useContact";
import { useTranslation } from "../../i18n/LanguageProvider";

export default function ContactPageForm() {
  const { t } = useTranslation();
  const { formData, errors, loading, handleChange, handleSubmit } =
    useContact();

  return (
    <div className="bg-white rounded-[1.75rem] sm:rounded-[2rem] p-8 sm:p-10 lg:p-12 shadow-[0_8px_30px_rgba(0,0,0,0.04)] h-full flex flex-col">
      <h2 className="text-xl sm:text-2xl font-bold text-[#1A1A1A] mb-8 lg:mb-10 leading-snug max-w-md">
        {t("contact.form.title")}
      </h2>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col flex-1 min-h-0"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-7">
          <HomeContactInput
            label={t("form.fullName")}
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            error={errors.fullName}
          />

          <HomeContactInput
            label={t("contact.form.email")}
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
        </div>

        <div className="mt-auto pt-8">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 bg-[#1A1A1A] text-white px-8 py-3.5 rounded-full text-sm font-semibold hover:bg-black transition disabled:opacity-70"
          >
            {loading ? t("form.sending") : t("form.submit")}
            {!loading && <span aria-hidden>→</span>}
          </button>
        </div>
      </form>
    </div>
  );
}
