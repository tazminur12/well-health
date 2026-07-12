"use client";

import {
  AlertTriangle,
  Bell,
  ChevronRight,
  Globe,
  History,
  Loader2,
  Lock,
  LogOut,
  MapPin,
  MessageSquare,
  Pencil,
  Plus,
  ShieldCheck,
  User,
} from "lucide-react";
import { useEffect, useRef, useState, useTransition, type ChangeEvent } from "react";

import { LogoutButton } from "@/components/auth/logout-button";
import {
  AddressCard,
  type CustomerAddress,
} from "@/components/customer/address-card";
import { AddAddressModal } from "@/components/customer/add-address-modal";
import { ChangePasswordModal } from "@/components/customer/change-password-modal";
import { DeleteAccountModal } from "@/components/customer/delete-account-modal";
import { ProfileSection } from "@/components/customer/profile-section";
import { ProfileSummaryCard } from "@/components/customer/profile-summary-card";
import {
  useCustomerProfile,
  useCustomerProfileMutations,
} from "@/hooks/use-customer-profile";
import { showError as showAlertError, showInfo, showSuccess } from "@/lib/alerts";
import type { CustomerPreferences } from "@/lib/profile/actions";
import { cn } from "@/lib/utils";

type GenderValue = "FEMALE" | "MALE" | "OTHER" | "UNSPECIFIED";

type PersonalDraft = {
  fullName: string;
  phone: string;
  dateOfBirth: string;
  gender: GenderValue;
};

function getInitials(name: string | null | undefined, email: string) {
  const trimmed = name?.trim();
  if (trimmed) {
    const parts = trimmed.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
    }
    return trimmed.slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

function formatJoined(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

function toLocalPhoneDigits(phone?: string | null) {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("880") && digits.length >= 13) return digits.slice(3);
  if (digits.startsWith("0") && digits.length >= 11) return digits.slice(1);
  return digits;
}

function formatPhoneDisplay(phone?: string | null) {
  const local = toLocalPhoneDigits(phone);
  return local ? `+880 ${local}` : "—";
}

function genderLabel(gender: GenderValue) {
  switch (gender) {
    case "FEMALE":
      return "Female";
    case "MALE":
      return "Male";
    case "OTHER":
      return "Other";
    default:
      return "—";
  }
}

function ToggleSwitch({
  checked,
  onChange,
  disabled = false,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      aria-checked={checked}
      aria-label={label}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200",
        checked ? "bg-brand-green-600" : "bg-neutral-300",
        disabled && "cursor-not-allowed opacity-50"
      )}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      role="switch"
      type="button"
    >
      <span
        className={cn(
          "inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200",
          checked ? "translate-x-[22px]" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

function SettingRow({
  icon: Icon,
  label,
  description,
  right,
  onClick,
}: {
  icon: typeof Bell;
  label: string;
  description?: string;
  right?: React.ReactNode;
  onClick?: () => void;
}) {
  const content = (
    <>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-600">
        <Icon className="h-4.5 w-4.5" />
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className="block text-sm font-medium text-neutral-900">{label}</span>
        {description ? <span className="block text-xs text-neutral-500">{description}</span> : null}
      </span>
      {right}
    </>
  );

  if (onClick) {
    return (
      <button
        className="flex min-h-14 w-full items-center gap-3 rounded-lg px-1 py-2 text-left transition-colors duration-200 hover:bg-neutral-50 active:bg-neutral-100"
        onClick={onClick}
        type="button"
      >
        {content}
      </button>
    );
  }

  return <div className="flex min-h-14 w-full items-center gap-3 px-1 py-2">{content}</div>;
}

function ReadonlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-neutral-100 py-3 last:border-b-0">
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-neutral-900">{value || "—"}</p>
    </div>
  );
}

type ModalKind = "address" | "password" | "delete" | null;

export function CustomerProfile() {
  const { data: profile, isLoading, isError, error, refetch } = useCustomerProfile();
  const {
    updateProfile,
    updatePreferences,
    changePassword,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    uploadAvatar,
    deleteAccount,
  } = useCustomerProfileMutations();

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<PersonalDraft>({
    fullName: "",
    phone: "",
    dateOfBirth: "",
    gender: "UNSPECIFIED",
  });
  const [activeModal, setActiveModal] = useState<ModalKind>(null);
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(null);
  const [prefsSaving, setPrefsSaving] = useState(false);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!profile) return;
    setDraft({
      fullName: profile.name ?? "",
      phone: toLocalPhoneDigits(profile.phone),
      dateOfBirth: profile.dateOfBirth ?? "",
      gender: profile.gender,
    });
  }, [profile]);

  const showToast = (message: string) => {
    void showSuccess("Success", message);
  };

  const showErrorToast = (message: string) => {
    void showAlertError("Something went wrong", message);
  };

  const closeModal = () => {
    setActiveModal(null);
    setEditingAddress(null);
  };

  const fieldClass =
    "h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-800 outline-none transition-all duration-200 focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20";

  const startEdit = () => {
    if (!profile) return;
    setDraft({
      fullName: profile.name ?? "",
      phone: toLocalPhoneDigits(profile.phone),
      dateOfBirth: profile.dateOfBirth ?? "",
      gender: profile.gender,
    });
    setEditing(true);
  };

  const saveInfo = () => {
    startTransition(async () => {
      try {
        await updateProfile.mutateAsync({
          name: draft.fullName,
          phone: draft.phone,
          dateOfBirth: draft.dateOfBirth,
          gender: draft.gender,
        });
        setEditing(false);
        showToast("Profile updated successfully");
        await refetch();
      } catch (err) {
        showErrorToast(err instanceof Error ? err.message : "Could not update profile");
      }
    });
  };

  const savePreference = async (next: CustomerPreferences) => {
    setPrefsSaving(true);
    try {
      await updatePreferences.mutateAsync(next);
      showToast("Preferences saved");
    } catch (err) {
      showErrorToast(err instanceof Error ? err.message : "Could not save preferences");
    } finally {
      setPrefsSaving(false);
    }
  };

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      await uploadAvatar.mutateAsync(file);
      showToast("Profile photo updated");
      await refetch();
    } catch (err) {
      showErrorToast(err instanceof Error ? err.message : "Upload failed");
    }
  };

  const saveAddress = async (
    address: Omit<CustomerAddress, "id"> & { id?: string }
  ) => {
    try {
      const payload = {
        fullName: address.fullName,
        phone: address.phone,
        district: address.district,
        area: address.area,
        details: address.details,
        isDefault: address.isDefault,
      };
      if (address.id) {
        await updateAddress.mutateAsync({ id: address.id, input: payload });
      } else {
        await createAddress.mutateAsync(payload);
      }
      closeModal();
      showToast("Address saved successfully");
      await refetch();
    } catch (err) {
      showErrorToast(err instanceof Error ? err.message : "Could not save address");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center gap-3 text-sm text-neutral-500">
        <Loader2 className="h-6 w-6 animate-spin text-brand-green-600" />
        Loading your profile…
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center gap-3 rounded-2xl border border-neutral-200 bg-white p-8 text-center">
        <p className="text-sm text-neutral-600">
          {error instanceof Error ? error.message : "Could not load profile."}
        </p>
        <button
          className="min-h-10 rounded-xl bg-brand-green-600 px-4 text-sm font-semibold text-white hover:bg-brand-green-900"
          onClick={() => refetch()}
          type="button"
        >
          Try again
        </button>
      </div>
    );
  }

  const preferences = profile.preferences;
  const addressBusy =
    createAddress.isPending || updateAddress.isPending || deleteAddress.isPending;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-heading text-xl font-bold text-neutral-900 sm:text-2xl">My Profile</h1>
        <p className="mt-1 text-sm text-neutral-500">Manage your account information</p>
      </header>

      <input
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleAvatarChange}
        ref={fileInputRef}
        type="file"
      />

      <ProfileSummaryCard
        avatarUrl={profile.avatarUrl}
        email={profile.email}
        initials={getInitials(profile.name, profile.email)}
        memberSince={formatJoined(profile.createdAt)}
        name={profile.name?.trim() || "Well Health Member"}
        onChangePhoto={() => fileInputRef.current?.click()}
        uploading={uploadAvatar.isPending}
        verified
      />

      <ProfileSection
        defaultOpen
        headerAction={
          !editing ? (
            <button
              aria-label="Edit personal information"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-neutral-500 transition-colors duration-200 hover:bg-neutral-50 hover:text-brand-green-600"
              onClick={startEdit}
              type="button"
            >
              <Pencil className="h-4 w-4" />
            </button>
          ) : null
        }
        icon={User}
        title="Personal Information"
      >
        {editing ? (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-neutral-700" htmlFor="pi-name">
                Full Name
              </label>
              <input
                className={fieldClass}
                id="pi-name"
                onChange={(event) => setDraft((d) => ({ ...d, fullName: event.target.value }))}
                value={draft.fullName}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-neutral-700" htmlFor="pi-email">
                Email
              </label>
              <input
                className={cn(fieldClass, "cursor-not-allowed bg-neutral-50 text-neutral-500")}
                disabled
                id="pi-email"
                value={profile.email}
              />
              <p className="text-xs text-neutral-400">Email is managed by your sign-in account.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-neutral-700" htmlFor="pi-phone">
                Phone Number
              </label>
              <div className="flex h-11 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 transition-all duration-200 focus-within:border-brand-green-600 focus-within:ring-2 focus-within:ring-brand-green-600/20">
                <span className="inline-flex h-6 items-center rounded-md bg-neutral-100 px-2 text-xs font-medium text-neutral-600">
                  +880
                </span>
                <input
                  className="h-full w-full border-none bg-transparent p-0 text-sm text-neutral-800 outline-none"
                  id="pi-phone"
                  inputMode="tel"
                  onChange={(event) => setDraft((d) => ({ ...d, phone: event.target.value }))}
                  value={draft.phone}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-neutral-700" htmlFor="pi-dob">
                Date of Birth <span className="text-neutral-400">(optional)</span>
              </label>
              <input
                className={fieldClass}
                id="pi-dob"
                onChange={(event) => setDraft((d) => ({ ...d, dateOfBirth: event.target.value }))}
                type="date"
                value={draft.dateOfBirth}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-neutral-700" htmlFor="pi-gender">
                Gender <span className="text-neutral-400">(optional)</span>
              </label>
              <select
                className={fieldClass}
                id="pi-gender"
                onChange={(event) =>
                  setDraft((d) => ({ ...d, gender: event.target.value as GenderValue }))
                }
                value={draft.gender}
              >
                <option value="UNSPECIFIED">Prefer not to say</option>
                <option value="FEMALE">Female</option>
                <option value="MALE">Male</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:justify-end">
              <button
                className="min-h-11 rounded-xl border border-neutral-300 px-5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
                disabled={isPending}
                onClick={() => setEditing(false)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand-green-600 px-5 text-sm font-semibold text-white hover:bg-brand-green-900 disabled:opacity-50"
                disabled={isPending || draft.fullName.trim().length < 2}
                onClick={saveInfo}
                type="button"
              >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save Changes
              </button>
            </div>
          </div>
        ) : (
          <div>
            <ReadonlyField label="Full Name" value={profile.name ?? ""} />
            <div className="border-b border-neutral-100 py-3">
              <p className="text-xs text-neutral-500">Email</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-sm font-medium text-neutral-900">
                {profile.email}
                <ShieldCheck className="h-4 w-4 text-brand-green-600" />
              </p>
            </div>
            <ReadonlyField label="Phone Number" value={formatPhoneDisplay(profile.phone)} />
            <ReadonlyField label="Date of Birth" value={profile.dateOfBirth ?? ""} />
            <ReadonlyField label="Gender" value={genderLabel(profile.gender)} />
          </div>
        )}
      </ProfileSection>

      <ProfileSection
        defaultOpen
        headerAction={
          <button
            className="inline-flex min-h-10 items-center gap-1 rounded-xl border border-brand-green-600 px-3 text-xs font-semibold text-brand-green-600 transition-colors duration-200 hover:bg-brand-green-50"
            onClick={() => {
              setEditingAddress(null);
              setActiveModal("address");
            }}
            type="button"
          >
            <Plus className="h-4 w-4" />
            Add New
          </button>
        }
        icon={MapPin}
        title="Saved Addresses"
      >
        <div className="flex flex-col gap-3">
          {profile.addresses.length === 0 ? (
            <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50/60 px-4 py-8 text-center">
              <MapPin className="mx-auto h-8 w-8 text-neutral-300" />
              <p className="mt-2 text-sm font-medium text-neutral-700">No saved addresses yet</p>
              <p className="mt-1 text-xs text-neutral-500">
                Add a delivery address for faster checkout.
              </p>
            </div>
          ) : (
            profile.addresses.map((address) => (
              <AddressCard
                address={address}
                key={address.id}
                onDelete={async (id) => {
                  try {
                    await deleteAddress.mutateAsync(id);
                    showToast("Address removed");
                    await refetch();
                  } catch (err) {
                    showErrorToast(err instanceof Error ? err.message : "Could not delete address");
                  }
                }}
                onEdit={(a) => {
                  setEditingAddress(a);
                  setActiveModal("address");
                }}
                onSetDefault={async (id) => {
                  try {
                    await setDefaultAddress.mutateAsync(id);
                    showToast("Default address updated");
                    await refetch();
                  } catch (err) {
                    showErrorToast(err instanceof Error ? err.message : "Could not update default");
                  }
                }}
              />
            ))
          )}
        </div>
      </ProfileSection>

      <ProfileSection icon={Lock} title="Security">
        <div className="divide-y divide-neutral-100">
          <SettingRow
            icon={Lock}
            label="Change Password"
            onClick={() => setActiveModal("password")}
            right={<ChevronRight className="h-5 w-5 text-neutral-400" />}
          />
          <SettingRow
            description="Coming soon"
            icon={ShieldCheck}
            label="Two-Factor Authentication"
            right={
              <ToggleSwitch
                checked={false}
                disabled
                label="Two-factor authentication"
                onChange={() => undefined}
              />
            }
          />
          <SettingRow
            description="Coming soon"
            icon={History}
            label="Login Activity"
            onClick={() => void showInfo("Coming soon", "Login activity will be available shortly.")}
            right={<ChevronRight className="h-5 w-5 text-neutral-400" />}
          />
        </div>
      </ProfileSection>

      <ProfileSection icon={Globe} title="Preferences">
        <div className="divide-y divide-neutral-100">
          <SettingRow
            icon={Globe}
            label="Language"
            right={
              <div className="inline-flex rounded-xl border border-neutral-200 p-0.5">
                {(["en", "bn"] as const).map((lang) => (
                  <button
                    className={cn(
                      "min-h-9 rounded-lg px-3 text-xs font-semibold transition-colors duration-200 disabled:opacity-50",
                      preferences.language === lang
                        ? "bg-brand-green-600 text-white"
                        : "text-neutral-600 hover:bg-neutral-50"
                    )}
                    disabled={prefsSaving}
                    key={lang}
                    onClick={() =>
                      savePreference({ ...preferences, language: lang })
                    }
                    type="button"
                  >
                    {lang === "en" ? "EN" : "বাং"}
                  </button>
                ))}
              </div>
            }
          />
          <SettingRow
            description="Shipping, delivery & order status"
            icon={Bell}
            label="Order Updates"
            right={
              <ToggleSwitch
                checked={preferences.orderUpdates}
                disabled={prefsSaving}
                label="Order update emails"
                onChange={(value) =>
                  savePreference({ ...preferences, orderUpdates: value })
                }
              />
            }
          />
          <SettingRow
            description="Deals & special offers"
            icon={Bell}
            label="Promotions"
            right={
              <ToggleSwitch
                checked={preferences.promotions}
                disabled={prefsSaving}
                label="Promotion emails"
                onChange={(value) =>
                  savePreference({ ...preferences, promotions: value })
                }
              />
            }
          />
          <SettingRow
            description="Monthly health tips"
            icon={Bell}
            label="Newsletter"
            right={
              <ToggleSwitch
                checked={preferences.newsletter}
                disabled={prefsSaving}
                label="Newsletter emails"
                onChange={(value) =>
                  savePreference({ ...preferences, newsletter: value })
                }
              />
            }
          />
          <SettingRow
            description="Order alerts via SMS"
            icon={MessageSquare}
            label="SMS Notifications"
            right={
              <ToggleSwitch
                checked={preferences.sms}
                disabled={prefsSaving}
                label="SMS notifications"
                onChange={(value) => savePreference({ ...preferences, sms: value })}
              />
            }
          />
        </div>
      </ProfileSection>

      <ProfileSection icon={AlertTriangle} title="Danger Zone" tone="danger">
        <SettingRow
          description="Permanently remove your account and data"
          icon={AlertTriangle}
          label="Delete My Account"
          onClick={() => setActiveModal("delete")}
          right={<ChevronRight className="h-5 w-5 text-red-400" />}
        />
      </ProfileSection>

      <LogoutButton className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-red-600 px-4 py-3 text-sm font-semibold text-red-600 transition-colors duration-200 hover:bg-red-50">
        <LogOut className="h-4 w-4" />
        Log Out
      </LogoutButton>

      <AddAddressModal
        address={editingAddress}
        isSaving={addressBusy}
        onClose={closeModal}
        onSave={saveAddress}
        open={activeModal === "address"}
      />

      <ChangePasswordModal
        isSaving={changePassword.isPending}
        onClose={closeModal}
        onSave={async (values) => {
          try {
            await changePassword.mutateAsync(values);
            closeModal();
            showToast("Password updated successfully");
          } catch (err) {
            showErrorToast(err instanceof Error ? err.message : "Could not update password");
          }
        }}
        open={activeModal === "password"}
      />

      <DeleteAccountModal
        isSaving={deleteAccount.isPending}
        onClose={closeModal}
        onConfirm={async (confirmation) => {
          try {
            await deleteAccount.mutateAsync({ confirmation });
            window.location.href = "/login?deleted=1";
          } catch (err) {
            showErrorToast(err instanceof Error ? err.message : "Could not delete account");
          }
        }}
        open={activeModal === "delete"}
      />
    </div>
  );
}
