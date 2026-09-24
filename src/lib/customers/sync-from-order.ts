import { randomUUID } from "node:crypto";

import { Prisma, PrismaClient, Role, UserStatus, type User } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export const CUSTOMER_PLACEHOLDER_EMAIL_DOMAIN = "customers.wellhealth.invalid";

type Db = Prisma.TransactionClient | PrismaClient;

export type OrderCustomerInput = {
  userId?: string | null;
  email?: string | null;
  phone?: string | null;
  customerName?: string | null;
  shippingFullName?: string | null;
  shippingPhone?: string | null;
  shippingDistrict?: string | null;
  shippingArea?: string | null;
  shippingDetails?: string | null;
};

export function isPlaceholderCustomerEmail(email: string) {
  return email.toLowerCase().endsWith(`@${CUSTOMER_PLACEHOLDER_EMAIL_DOMAIN}`);
}

export function displayCustomerEmail(email: string) {
  return isPlaceholderCustomerEmail(email) ? "—" : email;
}

export function phoneKey(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length >= 10) return digits.slice(-10);
  return digits;
}

function clean(value: string | null | undefined) {
  return value?.trim() ?? "";
}

function sameText(left: string, right: string) {
  return left.trim().toLowerCase().replace(/\s+/g, " ") === right.trim().toLowerCase().replace(/\s+/g, " ");
}

function placeholderEmail(key: string) {
  return `phone.${key}@${CUSTOMER_PLACEHOLDER_EMAIL_DOMAIN}`;
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function findCustomerByPhone(db: Db, phone: string) {
  const key = phoneKey(phone);
  if (key.length < 10) return null;

  const rows = await db.$queryRaw<Array<{ id: string }>>`
    SELECT id
    FROM users
    WHERE role = 'CUSTOMER'
      AND right(regexp_replace(coalesce(phone, ''), '\\D', '', 'g'), 10) = ${key}
    ORDER BY created_at ASC
    LIMIT 1
  `;

  const id = rows[0]?.id;
  if (!id) return null;
  return db.user.findUnique({ where: { id } });
}

async function resolvePersonalEmail(db: Db, email: string, key: string) {
  if (!isEmail(email) || isPlaceholderCustomerEmail(email)) return null;

  const rows = await db.$queryRaw<Array<{ phone: string }>>`
    SELECT phone
    FROM orders
    WHERE lower(email) = ${email}
  `;

  const keys = new Set(
    rows.map((row) => phoneKey(row.phone)).filter((value) => value.length >= 10)
  );
  if (key.length >= 10) keys.add(key);
  if (keys.size > 1) return null;
  return email;
}

async function saveShippingAddress(db: Db, userId: string, input: OrderCustomerInput) {
  const fullName = clean(input.shippingFullName) || clean(input.customerName);
  const phone = clean(input.shippingPhone) || clean(input.phone);
  const district = clean(input.shippingDistrict);
  const area = clean(input.shippingArea);
  const details = clean(input.shippingDetails);
  if (!fullName || !phone || !district || !area || !details) return;

  const existing = await db.address.findMany({ where: { userId } });
  const alreadySaved = existing.some(
    (address) =>
      sameText(address.details, details) &&
      sameText(address.area, area) &&
      sameText(address.district, district)
  );
  if (alreadySaved) return;

  await db.address.create({
    data: {
      userId,
      fullName,
      phone,
      district,
      area,
      details,
      isDefault: existing.length === 0,
    },
  });
}

async function fillMissingProfile(db: Db, user: User, input: OrderCustomerInput, personalEmail: string | null) {
  const phone = clean(input.shippingPhone) || clean(input.phone);
  const name = clean(input.customerName) || clean(input.shippingFullName);
  const data: Prisma.UserUpdateInput = {};

  if (!user.name && name) data.name = name;
  if (!user.phone && phone) data.phone = phone;
  if (personalEmail && isPlaceholderCustomerEmail(user.email)) {
    const taken = await db.user.findUnique({ where: { email: personalEmail } });
    if (!taken || taken.id === user.id) data.email = personalEmail;
  }

  if (Object.keys(data).length === 0) return user;
  return db.user.update({ where: { id: user.id }, data });
}

/** Create or reuse a customer from checkout/order details and store the shipping address. */
export async function ensureCustomerFromOrder(
  input: OrderCustomerInput,
  db: Db = prisma,
  options?: { joinedAt?: Date }
) {
  const phone = clean(input.phone) || clean(input.shippingPhone);
  const key = phoneKey(phone);
  const personalEmail = await resolvePersonalEmail(
    db,
    clean(input.email).toLowerCase(),
    key
  );

  let user: User | null = null;
  let preferredId: string | null = null;
  if (input.userId) {
    const byId = await db.user.findUnique({ where: { id: input.userId } });
    if (byId?.role === Role.CUSTOMER) user = byId;
    else if (!byId) preferredId = input.userId;
  }
  if (!user && key.length >= 10) {
    user = await findCustomerByPhone(db, phone);
  }
  if (!user && personalEmail) {
    const byEmail = await db.user.findUnique({ where: { email: personalEmail } });
    if (byEmail?.role === Role.CUSTOMER) {
      const existingKey = phoneKey(byEmail.phone ?? "");
      if (!existingKey || existingKey === key) user = byEmail;
    }
  }

  if (!user) {
    let email = personalEmail ?? (key.length >= 10 ? placeholderEmail(key) : "");
    if (!email) return null;

    const taken = await db.user.findUnique({ where: { email } });
    if (taken) {
      const takenKey = phoneKey(taken.phone ?? "");
      if (taken.role === Role.CUSTOMER && (!takenKey || takenKey === key)) {
        user = taken;
      } else if (key.length >= 10) {
        email = placeholderEmail(key);
        user = await db.user.findUnique({ where: { email } });
      } else {
        return null;
      }
    }

    if (!user) {
      const name = clean(input.customerName) || clean(input.shippingFullName);
      user = await db.user.create({
        data: {
          id: preferredId ?? randomUUID(),
          email,
          name: name || null,
          phone: phone || null,
          role: Role.CUSTOMER,
          status: UserStatus.ACTIVE,
          ...(options?.joinedAt ? { createdAt: options.joinedAt } : {}),
        },
      });
    }
  }

  user = await fillMissingProfile(db, user, input, personalEmail);
  await saveShippingAddress(db, user.id, input);
  return user.id;
}
