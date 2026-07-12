"use client";

import {
  Banknote,
  Clock3,
  Loader2,
  MapPinned,
  Plus,
  Power,
  Search,
  Truck,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  useAdminShippingCouriers,
  useAdminShippingZones,
  useShippingMutations,
} from "@/hooks/use-admin-shipping";
import { useAdminStoreSettings } from "@/hooks/use-admin-settings";
import { confirmAdminAction, showAdminError, showAdminSuccess } from "@/lib/admin/alerts";
import type {
  AdminShippingCourier,
  AdminShippingZone,
  ShippingCourierInput,
  ShippingZoneInput,
} from "@/lib/shipping/schemas";
import { slugifyShipping } from "@/lib/shipping/schemas";
import { cn } from "@/lib/utils";

type Tab = "zones" | "couriers";

const emptyZone: ShippingZoneInput = {
  name: "",
  slug: "",
  description: "",
  areas: "",
  baseFee: 80,
  freeShippingMin: 2000,
  etaMinDays: 1,
  etaMaxDays: 3,
  codAvailable: true,
  isActive: true,
  sortOrder: 0,
};

const emptyCourier: ShippingCourierInput = {
  name: "",
  slug: "",
  contactPhone: "",
  trackingUrl: "",
  notes: "",
  isActive: true,
  sortOrder: 0,
};

const inputClass =
  "h-11 w-full rounded-xl border border-neutral-200 bg-white px-3.5 text-sm text-neutral-800 outline-none transition focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20";

const zoneGradients = [
  "from-[#E8F5EE] via-white to-[#F5F0E6]",
  "from-[#EAF3FF] via-white to-[#F0F7F3]",
  "from-[#F5F0E6] via-white to-[#E8F5EE]",
  "from-[#EEF8F3] via-[#F8FBF9] to-[#E6F4F0]",
];

const zoneBars = [
  "from-[#0B4D3A] to-[#16875D]",
  "from-[#16875D] to-[#C9A24B]",
  "from-[#1D4F91] to-[#16875D]",
  "from-[#0F766E] to-[#34D399]",
];

function formatMoney(value: number | null | undefined) {
  if (value == null) return "—";
  return `৳ ${value.toLocaleString("en-US")}`;
}

export function AdminShippingPage() {
  const {
    data: zones = [],
    isLoading: zonesLoading,
    isError: zonesError,
    error: zonesErr,
    refetch: refetchZones,
  } = useAdminShippingZones();
  const {
    data: couriers = [],
    isLoading: couriersLoading,
    isError: couriersError,
    error: couriersErr,
    refetch: refetchCouriers,
  } = useAdminShippingCouriers();
  const { data: storeSettings } = useAdminStoreSettings();
  const {
    createZone,
    updateZone,
    deleteZone,
    toggleZone,
    createCourier,
    updateCourier,
    deleteCourier,
    toggleCourier,
  } = useShippingMutations();

  const [tab, setTab] = useState<Tab>("zones");
  const [search, setSearch] = useState("");
  const [zoneDrawer, setZoneDrawer] = useState(false);
  const [courierDrawer, setCourierDrawer] = useState(false);
  const [editingZone, setEditingZone] = useState<AdminShippingZone | null>(null);
  const [editingCourier, setEditingCourier] = useState<AdminShippingCourier | null>(null);
  const [zoneForm, setZoneForm] = useState<ShippingZoneInput>(emptyZone);
  const [courierForm, setCourierForm] = useState<ShippingCourierInput>(emptyCourier);
  const [zoneSlugTouched, setZoneSlugTouched] = useState(false);
  const [courierSlugTouched, setCourierSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);

  const filteredZones = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return zones;
    return zones.filter(
      (z) =>
        z.name.toLowerCase().includes(q) ||
        z.areas.toLowerCase().includes(q) ||
        z.slug.toLowerCase().includes(q)
    );
  }, [search, zones]);

  const filteredCouriers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return couriers;
    return couriers.filter(
      (c) => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)
    );
  }, [couriers, search]);

  const stats = useMemo(() => {
    const activeZones = zones.filter((z) => z.isActive).length;
    const activeCouriers = couriers.filter((c) => c.isActive).length;
    const avgFee =
      zones.length === 0
        ? 0
        : Math.round(zones.reduce((sum, z) => sum + z.baseFee, 0) / zones.length);
    const codZones = zones.filter((z) => z.codAvailable && z.isActive).length;
    return { activeZones, activeCouriers, avgFee, codZones, totalZones: zones.length };
  }, [couriers, zones]);

  function openCreateZone() {
    setEditingZone(null);
    setZoneForm({ ...emptyZone, sortOrder: zones.length });
    setZoneSlugTouched(false);
    setZoneDrawer(true);
  }

  function openEditZone(zone: AdminShippingZone) {
    setEditingZone(zone);
    setZoneForm({
      name: zone.name,
      slug: zone.slug,
      description: zone.description ?? "",
      areas: zone.areas,
      baseFee: zone.baseFee,
      freeShippingMin: zone.freeShippingMin,
      etaMinDays: zone.etaMinDays,
      etaMaxDays: zone.etaMaxDays,
      codAvailable: zone.codAvailable,
      isActive: zone.isActive,
      sortOrder: zone.sortOrder,
    });
    setZoneSlugTouched(true);
    setZoneDrawer(true);
  }

  function openCreateCourier() {
    setEditingCourier(null);
    setCourierForm({ ...emptyCourier, sortOrder: couriers.length });
    setCourierSlugTouched(false);
    setCourierDrawer(true);
  }

  function openEditCourier(courier: AdminShippingCourier) {
    setEditingCourier(courier);
    setCourierForm({
      name: courier.name,
      slug: courier.slug,
      contactPhone: courier.contactPhone ?? "",
      trackingUrl: courier.trackingUrl ?? "",
      notes: courier.notes ?? "",
      isActive: courier.isActive,
      sortOrder: courier.sortOrder,
    });
    setCourierSlugTouched(true);
    setCourierDrawer(true);
  }

  async function saveZone() {
    setSaving(true);
    try {
      if (editingZone) {
        await updateZone.mutateAsync({ id: editingZone.id, input: zoneForm });
        await showAdminSuccess("Zone updated", `${zoneForm.name} saved.`);
      } else {
        await createZone.mutateAsync(zoneForm);
        await showAdminSuccess("Zone created", `${zoneForm.name} is ready.`);
      }
      setZoneDrawer(false);
    } catch (err) {
      await showAdminError(
        "Save failed",
        err instanceof Error ? err.message : "Please check the fields."
      );
    } finally {
      setSaving(false);
    }
  }

  async function saveCourier() {
    setSaving(true);
    try {
      if (editingCourier) {
        await updateCourier.mutateAsync({ id: editingCourier.id, input: courierForm });
        await showAdminSuccess("Courier updated", `${courierForm.name} saved.`);
      } else {
        await createCourier.mutateAsync(courierForm);
        await showAdminSuccess("Courier created", `${courierForm.name} is ready.`);
      }
      setCourierDrawer(false);
    } catch (err) {
      await showAdminError(
        "Save failed",
        err instanceof Error ? err.message : "Please check the fields."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteZone(zone: AdminShippingZone) {
    const ok = await confirmAdminAction({
      title: `Delete “${zone.name}”?`,
      text: "This zone will no longer be available at checkout.",
      confirmText: "Delete",
    });
    if (!ok) return;
    try {
      await deleteZone.mutateAsync(zone.id);
      await showAdminSuccess("Deleted", `${zone.name} removed.`);
    } catch (err) {
      await showAdminError(
        "Delete failed",
        err instanceof Error ? err.message : "Please try again."
      );
    }
  }

  async function handleDeleteCourier(courier: AdminShippingCourier) {
    const ok = await confirmAdminAction({
      title: `Delete “${courier.name}”?`,
      text: "This courier partner will be removed from the list.",
      confirmText: "Delete",
    });
    if (!ok) return;
    try {
      await deleteCourier.mutateAsync(courier.id);
      await showAdminSuccess("Deleted", `${courier.name} removed.`);
    } catch (err) {
      await showAdminError(
        "Delete failed",
        err instanceof Error ? err.message : "Please try again."
      );
    }
  }

  const loading = zonesLoading || couriersLoading;
  const error = zonesError || couriersError;

  if (loading) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 text-sm text-neutral-500">
        <Loader2 className="h-6 w-6 animate-spin text-brand-green-600" />
        Loading shipping…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
        <h2 className="font-heading text-xl font-bold text-neutral-900">
          Couldn’t load shipping
        </h2>
        <p className="mt-2 text-sm text-neutral-500">
          {zonesErr instanceof Error
            ? zonesErr.message
            : couriersErr instanceof Error
              ? couriersErr.message
              : "Something went wrong."}
        </p>
        <Button
          className="mt-5 rounded-xl"
          onClick={() => {
            void refetchZones();
            void refetchCouriers();
          }}
          type="button"
        >
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-green-100 bg-gradient-to-r from-brand-green-50 to-[#F5F0E6] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-green-800">
            <Truck className="h-3.5 w-3.5" />
            Bangladesh delivery
          </div>
          <h1 className="mt-3 font-heading text-2xl font-bold text-neutral-900 sm:text-3xl">
            Shipping & Delivery
          </h1>
          <p className="mt-1.5 max-w-xl text-sm leading-6 text-neutral-500">
            Configure delivery zones, fees, COD availability, and courier partners for checkout.
          </p>
        </div>
        <Button
          className="h-10 rounded-xl bg-gradient-to-r from-brand-green-900 to-brand-green-600 text-white shadow-[0_10px_24px_rgba(22,135,93,0.28)] hover:from-brand-green-900 hover:to-brand-green-900"
          onClick={() => (tab === "zones" ? openCreateZone() : openCreateCourier())}
          type="button"
        >
          <Plus className="h-4 w-4" />
          {tab === "zones" ? "Add zone" : "Add courier"}
        </Button>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active zones" value={String(stats.activeZones)} tone="green" />
        <StatCard label="Avg base fee" value={formatMoney(stats.avgFee)} tone="gold" />
        <StatCard label="COD zones" value={String(stats.codZones)} tone="teal" />
        <StatCard label="Active couriers" value={String(stats.activeCouriers)} tone="slate" />
      </section>

      <div className="overflow-hidden rounded-3xl border border-white/80 bg-gradient-to-br from-[#0B4D3A] via-[#127A56] to-[#16875D] p-5 text-white shadow-[0_18px_40px_rgba(11,77,58,0.2)] sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/65">
              Store defaults
            </p>
            <p className="mt-1 font-heading text-2xl font-bold tracking-tight sm:text-3xl">
              Free shipping from{" "}
              {formatMoney(storeSettings?.freeShippingMin ?? 2000)}
            </p>
            <p className="mt-1 text-sm text-white/75">
              COD globally{" "}
              {storeSettings?.codEnabled === false ? "disabled" : "enabled"} in{" "}
              <Link className="underline decoration-white/40 underline-offset-2" href="/admin/settings">
                Settings → Orders
              </Link>
            </p>
          </div>
          <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-sm">
            <p className="text-sm font-medium">
              {stats.totalZones} zone{stats.totalZones === 1 ? "" : "s"} configured
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center">
        <div className="inline-flex rounded-xl border border-neutral-200 bg-neutral-50 p-1">
          <button
            className={cn(
              "rounded-lg px-3.5 py-2 text-sm font-medium transition",
              tab === "zones"
                ? "bg-white text-brand-green-900 shadow-sm"
                : "text-neutral-600 hover:text-neutral-900"
            )}
            onClick={() => setTab("zones")}
            type="button"
          >
            Delivery zones
          </button>
          <button
            className={cn(
              "rounded-lg px-3.5 py-2 text-sm font-medium transition",
              tab === "couriers"
                ? "bg-white text-brand-green-900 shadow-sm"
                : "text-neutral-600 hover:text-neutral-900"
            )}
            onClick={() => setTab("couriers")}
            type="button"
          >
            Couriers
          </button>
        </div>
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            className="h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-10 pr-3 text-sm outline-none focus:border-brand-green-600 focus:bg-white focus:ring-2 focus:ring-brand-green-600/15"
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tab === "zones" ? "Search zones or areas…" : "Search couriers…"}
            value={search}
          />
        </div>
      </div>

      {tab === "zones" ? (
        filteredZones.length === 0 ? (
          <EmptyState
            title="No delivery zones"
            text="Add Dhaka Metro, Outside Dhaka, and other BD delivery areas."
            onAdd={openCreateZone}
            cta="Add zone"
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredZones.map((zone, index) => (
              <article
                key={zone.id}
                className={cn(
                  "relative overflow-hidden rounded-2xl border border-white/80 bg-gradient-to-br p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.1)]",
                  zoneGradients[index % zoneGradients.length],
                  !zone.isActive && "opacity-75"
                )}
              >
                <div
                  aria-hidden
                  className={cn(
                    "absolute inset-x-0 top-0 h-1 bg-gradient-to-r",
                    zoneBars[index % zoneBars.length]
                  )}
                />
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-heading text-lg font-bold text-neutral-900">
                        {zone.name}
                      </h3>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                          zone.isActive
                            ? "bg-brand-green-100 text-brand-green-800"
                            : "bg-neutral-200 text-neutral-600"
                        )}
                      >
                        {zone.isActive ? "Active" : "Inactive"}
                      </span>
                      {zone.codAvailable ? (
                        <span className="rounded-full bg-[#F5F0E6] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#8A6E2F]">
                          COD
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-xs font-medium text-brand-green-700">
                      /{zone.slug}
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm text-neutral-600">
                      {zone.description || zone.areas || "No areas listed"}
                    </p>
                  </div>
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-green-900 to-brand-green-600 text-white shadow-md">
                    <MapPinned className="h-5 w-5" />
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl bg-white/60 px-3 py-2 backdrop-blur-sm">
                    <p className="text-neutral-400">Base fee</p>
                    <p className="mt-0.5 font-semibold text-neutral-900">
                      {formatMoney(zone.baseFee)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/60 px-3 py-2 backdrop-blur-sm">
                    <p className="text-neutral-400">Free from</p>
                    <p className="mt-0.5 font-semibold text-neutral-900">
                      {formatMoney(zone.freeShippingMin)}
                    </p>
                  </div>
                  <div className="col-span-2 rounded-xl bg-white/60 px-3 py-2 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-neutral-700">
                      <Clock3 className="h-3.5 w-3.5 text-brand-green-700" />
                      <span className="font-semibold">
                        {zone.etaMinDays}–{zone.etaMaxDays} days ETA
                      </span>
                    </div>
                    {zone.areas ? (
                      <p className="mt-1 line-clamp-2 text-neutral-500">{zone.areas}</p>
                    ) : null}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5 border-t border-neutral-900/5 pt-4">
                  <button
                    className="inline-flex h-9 items-center rounded-lg px-3 text-xs font-semibold text-neutral-600 hover:bg-white"
                    onClick={() => openEditZone(zone)}
                    type="button"
                  >
                    Edit
                  </button>
                  <button
                    className="inline-flex h-9 items-center gap-1 rounded-lg px-3 text-xs font-semibold text-neutral-600 hover:bg-white"
                    onClick={() => void toggleZone.mutateAsync(zone.id)}
                    type="button"
                  >
                    <Power className="h-3.5 w-3.5" />
                    {zone.isActive ? "Disable" : "Enable"}
                  </button>
                  <button
                    className="inline-flex h-9 items-center gap-1 rounded-lg px-3 text-xs font-semibold text-red-600 hover:bg-red-50"
                    onClick={() => void handleDeleteZone(zone)}
                    type="button"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )
      ) : filteredCouriers.length === 0 ? (
        <EmptyState
          title="No couriers yet"
          text="Add Pathao, Steadfast, RedX, or your preferred BD partners."
          onAdd={openCreateCourier}
          cta="Add courier"
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <ul className="divide-y divide-neutral-100">
            {filteredCouriers.map((courier) => (
              <li
                key={courier.id}
                className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-green-900 to-brand-green-600 text-white shadow-md">
                    <Truck className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-heading text-base font-bold text-neutral-900">
                        {courier.name}
                      </p>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                          courier.isActive
                            ? "bg-brand-green-100 text-brand-green-800"
                            : "bg-neutral-200 text-neutral-600"
                        )}
                      >
                        {courier.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-neutral-500">/{courier.slug}</p>
                    {courier.notes ? (
                      <p className="mt-1 text-sm text-neutral-600">{courier.notes}</p>
                    ) : null}
                    <div className="mt-1 flex flex-wrap gap-x-3 text-xs text-neutral-500">
                      {courier.contactPhone ? <span>{courier.contactPhone}</span> : null}
                      {courier.trackingUrl ? (
                        <a
                          className="font-medium text-brand-green-700 hover:underline"
                          href={courier.trackingUrl}
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          Tracking portal
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    className="inline-flex h-9 items-center rounded-lg bg-neutral-100 px-3 text-xs font-semibold text-neutral-700 hover:bg-neutral-200"
                    onClick={() => openEditCourier(courier)}
                    type="button"
                  >
                    Edit
                  </button>
                  <button
                    className="inline-flex h-9 items-center gap-1 rounded-lg bg-neutral-100 px-3 text-xs font-semibold text-neutral-700 hover:bg-neutral-200"
                    onClick={() => void toggleCourier.mutateAsync(courier.id)}
                    type="button"
                  >
                    <Power className="h-3.5 w-3.5" />
                    {courier.isActive ? "Disable" : "Enable"}
                  </button>
                  <button
                    className="inline-flex h-9 items-center gap-1 rounded-lg bg-red-50 px-3 text-xs font-semibold text-red-700 hover:bg-red-100"
                    onClick={() => void handleDeleteCourier(courier)}
                    type="button"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {zoneDrawer ? (
        <ZoneDrawer
          form={zoneForm}
          isEditing={Boolean(editingZone)}
          saving={saving}
          slugTouched={zoneSlugTouched}
          onChange={setZoneForm}
          onClose={() => setZoneDrawer(false)}
          onSave={() => void saveZone()}
          onSlugTouched={() => setZoneSlugTouched(true)}
        />
      ) : null}

      {courierDrawer ? (
        <CourierDrawer
          form={courierForm}
          isEditing={Boolean(editingCourier)}
          saving={saving}
          slugTouched={courierSlugTouched}
          onChange={setCourierForm}
          onClose={() => setCourierDrawer(false)}
          onSave={() => void saveCourier()}
          onSlugTouched={() => setCourierSlugTouched(true)}
        />
      ) : null}
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "green" | "gold" | "teal" | "slate";
}) {
  const tones = {
    green: "from-[#E8F5EE] to-white border-brand-green-100",
    gold: "from-[#F5F0E6] to-white border-[#E8D9B0]",
    teal: "from-[#E6F4F0] to-white border-emerald-100",
    slate: "from-neutral-50 to-white border-neutral-200",
  };
  return (
    <div className={cn("rounded-2xl border bg-gradient-to-br p-4 shadow-sm", tones[tone])}>
      <p className="text-xs font-medium text-neutral-500">{label}</p>
      <p className="mt-1 font-heading text-2xl font-bold text-neutral-900">{value}</p>
    </div>
  );
}

function EmptyState({
  title,
  text,
  onAdd,
  cta,
}: {
  title: string;
  text: string;
  onAdd: () => void;
  cta: string;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-neutral-200 bg-gradient-to-br from-white via-[#F7F8F9] to-[#E8F5EE] px-6 py-16 text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-green-900 to-brand-green-600 text-white shadow-lg">
        <Truck className="h-6 w-6" />
      </span>
      <h2 className="mt-4 font-heading text-xl font-bold text-neutral-900">{title}</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-neutral-500">{text}</p>
      <Button className="mt-5 rounded-xl" onClick={onAdd} type="button">
        <Plus className="h-4 w-4" />
        {cta}
      </Button>
    </div>
  );
}

function ZoneDrawer({
  form,
  isEditing,
  saving,
  slugTouched,
  onChange,
  onClose,
  onSave,
  onSlugTouched,
}: {
  form: ShippingZoneInput;
  isEditing: boolean;
  saving: boolean;
  slugTouched: boolean;
  onChange: (next: ShippingZoneInput) => void;
  onClose: () => void;
  onSave: () => void;
  onSlugTouched: () => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  function patch<K extends keyof ShippingZoneInput>(key: K, value: ShippingZoneInput[K]) {
    onChange({ ...form, [key]: value });
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button aria-label="Close" className="absolute inset-0 bg-neutral-950/40" onClick={onClose} type="button" />
      <aside className="relative flex h-full w-full max-w-lg flex-col border-l border-neutral-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between bg-gradient-to-r from-brand-green-50 to-[#F5F0E6] px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-green-700">
              {isEditing ? "Edit zone" : "New zone"}
            </p>
            <h2 className="mt-1 font-heading text-xl font-bold text-neutral-900">
              Delivery zone
            </h2>
          </div>
          <button className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-white" onClick={onClose} type="button">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-neutral-700">Name</span>
            <input
              className={inputClass}
              onChange={(e) => {
                const name = e.target.value;
                onChange({
                  ...form,
                  name,
                  slug: slugTouched ? form.slug : slugifyShipping(name),
                });
              }}
              placeholder="Dhaka Metro"
              value={form.name}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-neutral-700">Slug</span>
            <input
              className={inputClass}
              onChange={(e) => {
                onSlugTouched();
                patch("slug", slugifyShipping(e.target.value));
              }}
              value={form.slug}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-neutral-700">Areas covered</span>
            <textarea
              className="min-h-[80px] w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
              onChange={(e) => patch("areas", e.target.value)}
              placeholder="Gulshan, Banani, Dhanmondi, Mirpur…"
              value={form.areas ?? ""}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-neutral-700">Description</span>
            <input
              className={inputClass}
              onChange={(e) => patch("description", e.target.value)}
              value={form.description ?? ""}
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-neutral-700">Base fee (৳)</span>
              <input
                className={inputClass}
                min={0}
                onChange={(e) => patch("baseFee", Number(e.target.value) || 0)}
                type="number"
                value={form.baseFee}
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-neutral-700">Free shipping min (৳)</span>
              <input
                className={inputClass}
                min={0}
                onChange={(e) =>
                  patch(
                    "freeShippingMin",
                    e.target.value === "" ? null : Number(e.target.value)
                  )
                }
                type="number"
                value={form.freeShippingMin ?? ""}
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-neutral-700">ETA min (days)</span>
              <input
                className={inputClass}
                min={0}
                onChange={(e) => patch("etaMinDays", Number(e.target.value) || 0)}
                type="number"
                value={form.etaMinDays}
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-neutral-700">ETA max (days)</span>
              <input
                className={inputClass}
                min={0}
                onChange={(e) => patch("etaMaxDays", Number(e.target.value) || 0)}
                type="number"
                value={form.etaMaxDays}
              />
            </label>
          </div>
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
            <input
              checked={form.codAvailable}
              className="mt-1 h-4 w-4 rounded border-neutral-300 text-brand-green-600"
              onChange={(e) => patch("codAvailable", e.target.checked)}
              type="checkbox"
            />
            <span>
              <span className="flex items-center gap-1.5 text-sm font-semibold text-neutral-900">
                <Banknote className="h-4 w-4 text-brand-green-700" />
                Cash on Delivery available
              </span>
              <span className="mt-0.5 block text-xs text-neutral-500">
                Recommended for most Bangladesh delivery zones
              </span>
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
            <input
              checked={form.isActive}
              className="mt-1 h-4 w-4 rounded border-neutral-300 text-brand-green-600"
              onChange={(e) => patch("isActive", e.target.checked)}
              type="checkbox"
            />
            <span>
              <span className="block text-sm font-semibold text-neutral-900">Active</span>
              <span className="mt-0.5 block text-xs text-neutral-500">
                Inactive zones stay hidden from checkout
              </span>
            </span>
          </label>
        </div>
        <div className="flex gap-2 border-t border-neutral-100 px-5 py-4">
          <Button className="h-11 flex-1 rounded-xl" onClick={onClose} type="button" variant="outline">
            Cancel
          </Button>
          <Button
            className="h-11 flex-1 rounded-xl bg-gradient-to-r from-brand-green-900 to-brand-green-600 text-white"
            disabled={saving || !form.name.trim() || !form.slug.trim()}
            onClick={onSave}
            type="button"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {isEditing ? "Save zone" : "Create zone"}
          </Button>
        </div>
      </aside>
    </div>
  );
}

function CourierDrawer({
  form,
  isEditing,
  saving,
  slugTouched,
  onChange,
  onClose,
  onSave,
  onSlugTouched,
}: {
  form: ShippingCourierInput;
  isEditing: boolean;
  saving: boolean;
  slugTouched: boolean;
  onChange: (next: ShippingCourierInput) => void;
  onClose: () => void;
  onSave: () => void;
  onSlugTouched: () => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  function patch<K extends keyof ShippingCourierInput>(
    key: K,
    value: ShippingCourierInput[K]
  ) {
    onChange({ ...form, [key]: value });
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button aria-label="Close" className="absolute inset-0 bg-neutral-950/40" onClick={onClose} type="button" />
      <aside className="relative flex h-full w-full max-w-lg flex-col border-l border-neutral-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between bg-gradient-to-r from-brand-green-50 to-[#F5F0E6] px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-green-700">
              {isEditing ? "Edit courier" : "New courier"}
            </p>
            <h2 className="mt-1 font-heading text-xl font-bold text-neutral-900">
              Courier partner
            </h2>
          </div>
          <button className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-white" onClick={onClose} type="button">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-neutral-700">Name</span>
            <input
              className={inputClass}
              onChange={(e) => {
                const name = e.target.value;
                onChange({
                  ...form,
                  name,
                  slug: slugTouched ? form.slug : slugifyShipping(name),
                });
              }}
              placeholder="Steadfast"
              value={form.name}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-neutral-700">Slug</span>
            <input
              className={inputClass}
              onChange={(e) => {
                onSlugTouched();
                patch("slug", slugifyShipping(e.target.value));
              }}
              value={form.slug}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-neutral-700">Contact phone</span>
            <input
              className={inputClass}
              onChange={(e) => patch("contactPhone", e.target.value)}
              placeholder="+8801XXXXXXXXX"
              value={form.contactPhone ?? ""}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-neutral-700">Tracking URL</span>
            <input
              className={inputClass}
              onChange={(e) => patch("trackingUrl", e.target.value)}
              placeholder="https://"
              value={form.trackingUrl ?? ""}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-neutral-700">Notes</span>
            <textarea
              className="min-h-[88px] w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-green-600 focus:ring-2 focus:ring-brand-green-600/20"
              onChange={(e) => patch("notes", e.target.value)}
              placeholder="Same-day in Dhaka, next-day outside…"
              value={form.notes ?? ""}
            />
          </label>
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
            <input
              checked={form.isActive}
              className="mt-1 h-4 w-4 rounded border-neutral-300 text-brand-green-600"
              onChange={(e) => patch("isActive", e.target.checked)}
              type="checkbox"
            />
            <span>
              <span className="block text-sm font-semibold text-neutral-900">Active</span>
              <span className="mt-0.5 block text-xs text-neutral-500">
                Show this partner in fulfillment workflows
              </span>
            </span>
          </label>
        </div>
        <div className="flex gap-2 border-t border-neutral-100 px-5 py-4">
          <Button className="h-11 flex-1 rounded-xl" onClick={onClose} type="button" variant="outline">
            Cancel
          </Button>
          <Button
            className="h-11 flex-1 rounded-xl bg-gradient-to-r from-brand-green-900 to-brand-green-600 text-white"
            disabled={saving || !form.name.trim() || !form.slug.trim()}
            onClick={onSave}
            type="button"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {isEditing ? "Save courier" : "Create courier"}
          </Button>
        </div>
      </aside>
    </div>
  );
}
