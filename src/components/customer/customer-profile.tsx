"use client";

import {
  AlertTriangle,
  Bell,
  ChevronRight,
  Globe,
  History,
  Lock,
  LogOut,
  MessageSquare,
  Pencil,
  Plus,
  ShieldCheck,
  Smartphone,
  User,
  X,
} from "lucide-react";
import { useState } from "react";

import { AuthToast } from "@/components/auth/auth-toast";
import {
  AddressCard,
  type CustomerAddress,
} from "@/components/customer/address-card";
import { AddAddressModal } from "@/components/customer/add-address-modal";
import { ChangePasswordModal } from "@/components/customer/change-password-modal";
import { ProfileSection } from "@/components/customer/profile-section";
import { ProfileSummaryCard } from "@/components/customer/profile-summary-card";
import { dummyCustomer } from "@/components/customer/customer-nav";
import { cn } from "@/lib/utils";

type PersonalInfo = {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
};

const initialInfo: PersonalInfo = {
  fullName: dummyCustomer.name,
  email: dummyCustomer.email,
  phone: "1712345678",
  dateOfBirth: "1996-04-12",
  gender: "Female",
};

const initialAddresses: CustomerAddress[] = [
  {
    id: "addr-1",
    fullName: "Ayesha Rahman",
    phone: "1712345678",
    district: "Dhaka",
    area: "Dhanmondi",
    details: "House 42, Road 8, Block C",
    isDefault: true,
  },
  {
    id: "addr-2",
    fullName: "Ayesha Rahman",
    phone: "1898765432",
    district: "Chattogram",
    area: "Panchlaish",
    details: "Flat 5B, Green Tower, Nasirabad",
    isDefault: false,
  },
];

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
        className="flex min-h-14 w-full items-center gap-3 rounded-lg px-1 py-2 text-left transition-colors duration-200 active:bg-neutral-100"
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
    <div className="border-b border-neutral-100 py-3">
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-neutral-900">{value || "—"}</p>
    </div>
  );
}

export function CustomerProfile() {
  const [toast, setToast] = useState<string | null>(null);

  const [info, setInfo] = useState<PersonalInfo>(initialInfo);
  const [draft, setDraft] = useState<PersonalInfo>(initialInfo);
  const [editing, setEditing] = useState(false);

  const [addresses, setAddresses] = useState<CustomerAddress[]>(initialAddresses);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(null);

  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);

  const [language, setLanguage] = useState<"en" | "bn">("en");
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotions: false,
    newsletter: true,
    sms: true,
  });

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2600);
  };

  const fieldClass =
    "h-11 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-800 outline-none transition-all duration-200 focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-100";

  const startEdit = () => {
    setDraft(info);
    setEditing(true);
  };

  const saveInfo = () => {
    setInfo(draft);
    setEditing(false);
    showToast("Profile updated successfully");
  };

  const saveAddress = (address: CustomerAddress) => {
    setAddresses((current) => {
      const normalized = address.isDefault
        ? current.map((a) => ({ ...a, isDefault: false }))
        : current;
      const exists = normalized.some((a) => a.id === address.id);
      const next = exists
        ? normalized.map((a) => (a.id === address.id ? address : a))
        : [...normalized, address];
      return next.some((a) => a.isDefault)
        ? next
        : next.map((a, index) => (index === 0 ? { ...a, isDefault: true } : a));
    });
    setAddressModalOpen(false);
    setEditingAddress(null);
    showToast("Address saved successfully");
  };

  const deleteAddress = (id: string) => {
    setAddresses((current) => {
      const next = current.filter((a) => a.id !== id);
      return next.some((a) => a.isDefault) || next.length === 0
        ? next
        : next.map((a, index) => (index === 0 ? { ...a, isDefault: true } : a));
    });
    showToast("Address removed");
  };

  const setDefaultAddress = (id: string) => {
    setAddresses((current) => current.map((a) => ({ ...a, isDefault: a.id === id })));
    showToast("Default address updated");
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-heading text-xl font-bold text-neutral-900 sm:text-2xl">My Profile</h1>
        <p className="mt-1 text-sm text-neutral-500">Manage your account information</p>
      </header>

      <ProfileSummaryCard
        email={info.email}
        initials={dummyCustomer.initials}
        memberSince="Jan 2026"
        name={info.fullName}
        onChangePhoto={() => showToast("Photo upload coming soon")}
        verified
      />

      <ProfileSection
        defaultOpen
        headerAction={
          !editing ? (
            <button
              aria-label="Edit personal information"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-neutral-500 transition-colors duration-200 active:bg-neutral-100 hover:bg-neutral-50 hover:text-brand-green-600"
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
              <div className="flex items-center gap-2">
                <input
                  className={cn(fieldClass, "flex-1 cursor-not-allowed bg-neutral-50 text-neutral-500")}
                  disabled
                  id="pi-email"
                  value={draft.email}
                />
                <button
                  className="min-h-11 shrink-0 rounded-lg border border-brand-green-600 px-3 text-xs font-semibold text-brand-green-600 transition-colors duration-200 active:bg-brand-green-100 hover:bg-brand-green-100"
                  onClick={() => showToast("Change email flow coming soon")}
                  type="button"
                >
                  Change
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-neutral-700" htmlFor="pi-phone">
                Phone Number
              </label>
              <div className="flex h-11 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 transition-all duration-200 focus-within:border-brand-green-600 focus-within:ring-2 focus-within:ring-brand-green-100">
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
                onChange={(event) => setDraft((d) => ({ ...d, gender: event.target.value }))}
                value={draft.gender}
              >
                <option value="">Prefer not to say</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:justify-end">
              <button
                className="min-h-11 rounded-lg border border-neutral-300 px-5 text-sm font-semibold text-neutral-700 transition-colors duration-200 active:bg-neutral-100 hover:bg-neutral-50"
                onClick={() => setEditing(false)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="min-h-11 rounded-lg bg-brand-green-600 px-5 text-sm font-semibold text-white transition-colors duration-200 active:bg-brand-green-900 hover:bg-brand-green-900"
                onClick={saveInfo}
                type="button"
              >
                Save Changes
              </button>
            </div>
          </div>
        ) : (
          <div>
            <ReadonlyField label="Full Name" value={info.fullName} />
            <div className="border-b border-neutral-100 py-3">
              <p className="text-xs text-neutral-500">Email</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-sm font-medium text-neutral-900">
                {info.email}
                <ShieldCheck className="h-4 w-4 text-brand-green-600" />
              </p>
            </div>
            <ReadonlyField label="Phone Number" value={`+880 ${info.phone}`} />
            <ReadonlyField label="Date of Birth" value={info.dateOfBirth} />
            <div className="py-3">
              <p className="text-xs text-neutral-500">Gender</p>
              <p className="mt-0.5 text-sm font-medium text-neutral-900">{info.gender || "—"}</p>
            </div>
          </div>
        )}
      </ProfileSection>

      <ProfileSection
        defaultOpen
        headerAction={
          <button
            className="inline-flex min-h-10 items-center gap-1 rounded-lg border border-brand-green-600 px-3 text-xs font-semibold text-brand-green-600 transition-colors duration-200 active:bg-brand-green-100 hover:bg-brand-green-100"
            onClick={() => {
              setEditingAddress(null);
              setAddressModalOpen(true);
            }}
            type="button"
          >
            <Plus className="h-4 w-4" />
            Add New
          </button>
        }
        icon={Smartphone}
        title="Saved Addresses"
      >
        <div className="flex flex-col gap-3">
          {addresses.length === 0 ? (
            <p className="py-4 text-center text-sm text-neutral-500">No saved addresses yet.</p>
          ) : (
            addresses.map((address) => (
              <AddressCard
                address={address}
                key={address.id}
                onDelete={deleteAddress}
                onEdit={(a) => {
                  setEditingAddress(a);
                  setAddressModalOpen(true);
                }}
                onSetDefault={setDefaultAddress}
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
            onClick={() => setPasswordModalOpen(true)}
            right={<ChevronRight className="h-5 w-5 text-neutral-400" />}
          />
          <SettingRow
            description="Coming soon"
            icon={ShieldCheck}
            label="Two-Factor Authentication"
            right={
              <ToggleSwitch
                checked={twoFactor}
                disabled
                label="Two-factor authentication"
                onChange={setTwoFactor}
              />
            }
          />
          <SettingRow
            description="3 recent sessions"
            icon={History}
            label="Login Activity"
            onClick={() => showToast("Login activity coming soon")}
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
              <div className="inline-flex rounded-lg border border-neutral-200 p-0.5">
                <button
                  className={cn(
                    "min-h-9 rounded-md px-3 text-xs font-semibold transition-colors duration-200",
                    language === "en"
                      ? "bg-brand-green-600 text-white"
                      : "text-neutral-600 active:bg-neutral-100"
                  )}
                  onClick={() => setLanguage("en")}
                  type="button"
                >
                  EN
                </button>
                <button
                  className={cn(
                    "min-h-9 rounded-md px-3 text-xs font-semibold transition-colors duration-200",
                    language === "bn"
                      ? "bg-brand-green-600 text-white"
                      : "text-neutral-600 active:bg-neutral-100"
                  )}
                  onClick={() => setLanguage("bn")}
                  type="button"
                >
                  বাং
                </button>
              </div>
            }
          />
          <SettingRow
            description="Shipping, delivery & order status"
            icon={Bell}
            label="Order Updates"
            right={
              <ToggleSwitch
                checked={notifications.orderUpdates}
                label="Order update emails"
                onChange={(value) => setNotifications((n) => ({ ...n, orderUpdates: value }))}
              />
            }
          />
          <SettingRow
            description="Deals & special offers"
            icon={Bell}
            label="Promotions"
            right={
              <ToggleSwitch
                checked={notifications.promotions}
                label="Promotion emails"
                onChange={(value) => setNotifications((n) => ({ ...n, promotions: value }))}
              />
            }
          />
          <SettingRow
            description="Monthly health tips"
            icon={Bell}
            label="Newsletter"
            right={
              <ToggleSwitch
                checked={notifications.newsletter}
                label="Newsletter emails"
                onChange={(value) => setNotifications((n) => ({ ...n, newsletter: value }))}
              />
            }
          />
          <SettingRow
            description="Order alerts via SMS"
            icon={MessageSquare}
            label="SMS Notifications"
            right={
              <ToggleSwitch
                checked={notifications.sms}
                label="SMS notifications"
                onChange={(value) => setNotifications((n) => ({ ...n, sms: value }))}
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
          onClick={() => {
            setDeleteConfirm("");
            setDeleteOpen(true);
          }}
          right={<ChevronRight className="h-5 w-5 text-red-400" />}
        />
      </ProfileSection>

      <button
        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-red-600 px-4 py-3 text-sm font-semibold text-red-600 transition-colors duration-200 active:bg-red-50 hover:bg-red-50"
        onClick={() => showToast("Logging out…")}
        type="button"
      >
        <LogOut className="h-4 w-4" />
        Log Out
      </button>

      <AddAddressModal
        address={editingAddress}
        onClose={() => {
          setAddressModalOpen(false);
          setEditingAddress(null);
        }}
        onSave={saveAddress}
        open={addressModalOpen}
      />

      <ChangePasswordModal
        onClose={() => setPasswordModalOpen(false)}
        onSave={() => {
          setPasswordModalOpen(false);
          showToast("Password updated successfully");
        }}
        open={passwordModalOpen}
      />

      {/* Delete account confirmation */}
      <div
        aria-hidden={!deleteOpen}
        className={cn("fixed inset-0 z-[60]", deleteOpen ? "pointer-events-auto" : "pointer-events-none")}
      >
        <button
          aria-label="Close"
          className={cn(
            "absolute inset-0 bg-neutral-950/40 transition-opacity duration-200",
            deleteOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setDeleteOpen(false)}
          type="button"
        />
        <div className="absolute inset-0 flex items-end justify-center sm:items-center">
          <div
            className={cn(
              "w-full rounded-t-2xl bg-white shadow-xl transition-transform duration-200 sm:max-w-md sm:rounded-2xl",
              deleteOpen ? "translate-y-0" : "translate-y-full sm:translate-y-4"
            )}
          >
            <div className="flex items-center justify-between gap-3 border-b border-neutral-200 px-5 py-4">
              <h3 className="flex items-center gap-2 font-heading text-base font-bold text-red-700">
                <AlertTriangle className="h-5 w-5" />
                Delete Account
              </h3>
              <button
                aria-label="Close"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 transition-colors duration-200 active:bg-neutral-100 hover:bg-neutral-50"
                onClick={() => setDeleteOpen(false)}
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 px-5 py-4">
              <p className="text-sm text-neutral-600">
                This action is permanent. All your orders, addresses, and wishlist items will be
                removed and cannot be recovered. Type <span className="font-semibold text-neutral-900">DELETE</span> to
                confirm.
              </p>
              <input
                className="h-11 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-800 outline-none transition-all duration-200 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                onChange={(event) => setDeleteConfirm(event.target.value)}
                placeholder="Type DELETE"
                value={deleteConfirm}
              />
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-neutral-200 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:flex-row sm:justify-end">
              <button
                className="min-h-11 rounded-lg border border-neutral-300 px-5 text-sm font-semibold text-neutral-700 transition-colors duration-200 active:bg-neutral-100 hover:bg-neutral-50"
                onClick={() => setDeleteOpen(false)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="min-h-11 rounded-lg bg-red-600 px-5 text-sm font-semibold text-white transition-colors duration-200 active:bg-red-700 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={deleteConfirm !== "DELETE"}
                onClick={() => {
                  setDeleteOpen(false);
                  showToast("Account deletion requested");
                }}
                type="button"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      <AuthToast message={toast} onClose={() => setToast(null)} />
    </div>
  );
}
