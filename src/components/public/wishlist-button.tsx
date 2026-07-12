"use client";

import { Heart, Loader2 } from "lucide-react";
import { useCallback, useState, useTransition, type MouseEvent } from "react";
import { useRouter } from "next/navigation";

import { useWishlistAuth } from "@/components/public/wishlist-provider";
import { showError, showSuccess } from "@/lib/alerts";
import { toggleWishlistAction } from "@/lib/wishlist/actions";
import { useWishlistStore, type WishlistStoreItem } from "@/store/wishlist-store";
import { cn } from "@/lib/utils";

type WishlistButtonProps = {
  product: Omit<WishlistStoreItem, "addedAt">;
  className?: string;
  iconClassName?: string;
};

export function WishlistButton({ product, className, iconClassName }: WishlistButtonProps) {
  const isAuthenticated = useWishlistAuth();
  const router = useRouter();
  const wishlisted = useWishlistStore((state) =>
    state.items.some((item) => item.productId === product.productId)
  );
  const toggleItem = useWishlistStore((state) => state.toggleItem);
  const addItem = useWishlistStore((state) => state.addItem);
  const removeItem = useWishlistStore((state) => state.removeItem);
  const [isPending, startTransition] = useTransition();
  const [pulse, setPulse] = useState(false);

  const handleClick = useCallback(
    (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();

      if (isPending) return;

      // Guests: local wishlist only (synced after sign-in)
      if (!isAuthenticated) {
        const next = toggleItem(product);
        setPulse(true);
        window.setTimeout(() => setPulse(false), 280);
        void showSuccess(
          next ? "Added to wishlist" : "Removed from wishlist",
          next
            ? `${product.name} is saved on this device. Sign in to keep it across devices.`
            : `${product.name} was removed from your wishlist.`
        );
        return;
      }

      const next = toggleItem(product);
      setPulse(true);
      window.setTimeout(() => setPulse(false), 280);

      startTransition(async () => {
        const result = await toggleWishlistAction({ productId: product.productId });
        if (result.error) {
          if (next) removeItem(product.productId);
          else addItem(product);
          if (result.error.toLowerCase().includes("sign in")) {
            router.push(`/login?next=${encodeURIComponent(`/shop/${product.slug}`)}`);
            return;
          }
          await showError("Wishlist update failed", result.error);
          return;
        }

        if (result.data?.wishlisted) {
          const serverItem = result.data.item;
          addItem(
            serverItem
              ? {
                  productId: serverItem.id,
                  slug: serverItem.slug,
                  name: serverItem.name,
                  category: serverItem.category,
                  price: serverItem.price,
                  imageUrl: serverItem.imageUrl,
                  imageTone: serverItem.imageTone,
                  inStock: serverItem.inStock,
                }
              : product
          );
          await showSuccess("Added to wishlist", `${product.name} is saved to your account.`);
        } else {
          removeItem(product.productId);
          await showSuccess("Removed from wishlist", `${product.name} was removed.`);
        }
      });
    },
    [addItem, isAuthenticated, isPending, product, removeItem, router, toggleItem]
  );

  return (
    <button
      aria-label={
        wishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`
      }
      aria-pressed={wishlisted}
      className={cn(className, pulse && "scale-90")}
      disabled={isPending}
      onClick={handleClick}
      type="button"
    >
      {isPending ? (
        <Loader2 className={cn("h-4 w-4 animate-spin", iconClassName)} />
      ) : (
        <Heart
          className={cn(
            "h-4 w-4 transition-colors duration-200",
            wishlisted && "fill-current text-rose-500",
            iconClassName
          )}
        />
      )}
    </button>
  );
}
