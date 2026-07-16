"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Send } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  bdDivisions,
  getBdDistricts,
} from "@/lib/bd-locations";
import { showAuthError, showAuthSuccess } from "@/lib/auth/alerts";
import { submitDistributorApplicationAction } from "@/lib/distributors/actions";
import {
  mapPublicBusinessType,
  mapPublicExperience,
} from "@/lib/distributors/schemas";

const distributorFormSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required").max(120),
  phone: z.string().trim().min(8, "Phone is required").max(30),
  email: z.string().trim().email("Enter a valid email").max(160),
  division: z.string().trim().min(2, "Select a division"),
  district: z.string().trim().min(2, "Select a district"),
  businessName: z.string().trim().max(160).optional().or(z.literal("")),
  businessType: z.enum(["pharmacy", "retail", "wholesale", "online", "other"], {
    required_error: "Select a business type",
  }),
  experience: z.enum(["new", "1-3", "3-5", "5plus"], {
    required_error: "Select your experience",
  }),
  coverageArea: z.string().trim().min(2, "Coverage area is required").max(200),
  message: z.string().trim().min(10, "Please share a short introduction").max(2000),
});

type DistributorFormValues = z.infer<typeof distributorFormSchema>;

const inputClassName =
  "w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-all duration-200 placeholder:text-neutral-400 focus:border-brand-green-600 focus:ring-4 focus:ring-brand-green-100 disabled:bg-neutral-50 disabled:text-neutral-400";

function FieldLabel({
  htmlFor,
  children,
  optional,
}: {
  htmlFor: string;
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <label className="mb-2 block text-sm font-medium text-neutral-800" htmlFor={htmlFor}>
      {children}
      {optional ? (
        <span className="ml-1.5 text-xs font-normal text-neutral-400">(optional)</span>
      ) : null}
    </label>
  );
}

const businessTypeLabels: Record<DistributorFormValues["businessType"], string> = {
  pharmacy: "Pharmacy / Chemist",
  retail: "Retail store",
  wholesale: "Wholesale trading",
  online: "Online / e-commerce",
  other: "Other",
};

const experienceLabels: Record<DistributorFormValues["experience"], string> = {
  new: "New to distribution",
  "1-3": "1–3 years",
  "3-5": "3–5 years",
  "5plus": "5+ years",
};

export function DistributorApplicationForm() {
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DistributorFormValues>({
    resolver: zodResolver(distributorFormSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      division: "",
      district: "",
      businessName: "",
      businessType: undefined,
      experience: undefined,
      coverageArea: "",
      message: "",
    },
  });

  const division = watch("division");
  const districts = useMemo(() => getBdDistricts(division), [division]);

  const onSubmit = async (values: DistributorFormValues) => {
    setSubmitting(true);
    try {
      const result = await submitDistributorApplicationAction({
        fullName: values.fullName,
        phone: values.phone,
        email: values.email,
        division: values.division,
        district: values.district,
        businessName: values.businessName,
        businessType: mapPublicBusinessType(values.businessType),
        experience: mapPublicExperience(values.experience),
        coverageArea: values.coverageArea,
        message: values.message,
      });

      if (result.error) {
        await showAuthError("Couldn’t submit", result.error);
        return;
      }

      reset();
      await showAuthSuccess(
        "Application received",
        result.success ?? "Our partnership team will contact you soon."
      );
    } catch {
      await showAuthError("Couldn’t submit", "Please try again in a moment.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-[#E8F5EE] via-white to-[#F5F0E6] p-6 shadow-[0_12px_36px_rgba(15,23,42,0.05)] ring-1 ring-neutral-200/70 sm:p-8 lg:p-9"
      id="apply"
    >
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#0B4D3A] via-[#C9A24B] to-[#16875D]"
      />

      <div className="relative mb-8 space-y-3">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-green-600">
          Partnership application
        </p>
        <h2 className="font-heading text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
          Apply to become a distributor
        </h2>
        <p className="max-w-xl text-sm leading-7 text-neutral-500">
          Share your details below. Our partnership team reviews every application and
          typically responds within 2–3 business days.
        </p>
      </div>

      <form className="relative space-y-5" noValidate onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <FieldLabel htmlFor="fullName">Full name</FieldLabel>
            <input
              className={inputClassName}
              id="fullName"
              placeholder="Your full name"
              {...register("fullName")}
            />
            {errors.fullName ? (
              <p className="mt-1 text-xs text-red-600">{errors.fullName.message}</p>
            ) : null}
          </div>
          <div>
            <FieldLabel htmlFor="phone">Phone number</FieldLabel>
            <input
              className={inputClassName}
              id="phone"
              inputMode="tel"
              placeholder="01XXXXXXXXX"
              {...register("phone")}
            />
            {errors.phone ? (
              <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>
            ) : null}
          </div>
        </div>

        <div>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <input
            className={inputClassName}
            id="email"
            placeholder="you@example.com"
            type="email"
            {...register("email")}
          />
          {errors.email ? (
            <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
          ) : null}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <FieldLabel htmlFor="division">Division</FieldLabel>
            <select
              className={inputClassName}
              id="division"
              {...register("division", {
                onChange: () => setValue("district", ""),
              })}
            >
              <option value="">Select division</option>
              {bdDivisions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            {errors.division ? (
              <p className="mt-1 text-xs text-red-600">{errors.division.message}</p>
            ) : null}
          </div>
          <div>
            <FieldLabel htmlFor="district">District</FieldLabel>
            <select
              className={inputClassName}
              disabled={!division}
              id="district"
              {...register("district")}
            >
              <option value="">
                {division ? "Select district" : "Select division first"}
              </option>
              {districts.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            {errors.district ? (
              <p className="mt-1 text-xs text-red-600">{errors.district.message}</p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <FieldLabel htmlFor="businessName" optional>
              Business / shop name
            </FieldLabel>
            <input
              className={inputClassName}
              id="businessName"
              placeholder="e.g. City Care Pharmacy"
              {...register("businessName")}
            />
          </div>
          <div>
            <FieldLabel htmlFor="businessType">Business type</FieldLabel>
            <select className={inputClassName} id="businessType" {...register("businessType")}>
              <option value="">Select type</option>
              {(Object.keys(businessTypeLabels) as DistributorFormValues["businessType"][]).map(
                (key) => (
                  <option key={key} value={key}>
                    {businessTypeLabels[key]}
                  </option>
                )
              )}
            </select>
            {errors.businessType ? (
              <p className="mt-1 text-xs text-red-600">{errors.businessType.message}</p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <FieldLabel htmlFor="experience">Distribution experience</FieldLabel>
            <select className={inputClassName} id="experience" {...register("experience")}>
              <option value="">Select experience</option>
              {(Object.keys(experienceLabels) as DistributorFormValues["experience"][]).map(
                (key) => (
                  <option key={key} value={key}>
                    {experienceLabels[key]}
                  </option>
                )
              )}
            </select>
            {errors.experience ? (
              <p className="mt-1 text-xs text-red-600">{errors.experience.message}</p>
            ) : null}
          </div>
          <div>
            <FieldLabel htmlFor="coverageArea">Intended coverage area</FieldLabel>
            <input
              className={inputClassName}
              id="coverageArea"
              placeholder="e.g. Gazipur + nearby upazilas"
              {...register("coverageArea")}
            />
            {errors.coverageArea ? (
              <p className="mt-1 text-xs text-red-600">{errors.coverageArea.message}</p>
            ) : null}
          </div>
        </div>

        <div>
          <FieldLabel htmlFor="message">Tell us about yourself</FieldLabel>
          <textarea
            className={`${inputClassName} min-h-36 resize-none`}
            id="message"
            placeholder="Share your background, current network, and why you’d like to partner with Well Health…"
            rows={5}
            {...register("message")}
          />
          {errors.message ? (
            <p className="mt-1 text-xs text-red-600">{errors.message.message}</p>
          ) : null}
        </div>

        <button
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-green-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-green-900 hover:shadow-md disabled:opacity-60"
          disabled={submitting}
          type="submit"
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          {submitting ? "Submitting…" : "Submit application"}
        </button>

        <p className="text-center text-xs leading-5 text-neutral-400">
          By submitting, you agree to be contacted by Well Health Trade International regarding
          this partnership enquiry.
        </p>
      </form>
    </section>
  );
}
