import { Star } from "lucide-react";

type ReviewCardProps = {
  name: string;
  initials: string;
  date: string;
  rating: number;
  comment: string;
};

export function ReviewCard({ name, initials, date, rating, comment }: ReviewCardProps) {
  return (
    <article className="flex gap-4 border-b border-neutral-200 py-5 last:border-b-0 last:pb-0">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-green-100 font-semibold text-brand-green-600">
        {initials}
      </div>

      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <h4 className="font-semibold text-neutral-900">{name}</h4>
          <div className="flex items-center gap-1 text-brand-green-600">
            {Array.from({ length: 5 }, (_, index) => (
              <Star
                key={index}
                className={`h-4 w-4 ${index < rating ? "fill-current" : "text-neutral-300"}`}
              />
            ))}
          </div>
          <span className="text-xs text-neutral-500">{date}</span>
        </div>

        <p className="text-sm leading-7 text-neutral-500">{comment}</p>
      </div>
    </article>
  );
}