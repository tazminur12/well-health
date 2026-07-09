type RatingBreakdownProps = {
  ratings: Array<{ stars: number; percentage: number }>;
};

export function RatingBreakdown({ ratings }: RatingBreakdownProps) {
  return (
    <div className="space-y-3">
      {ratings.map(({ stars, percentage }) => (
        <div key={stars} className="flex items-center gap-3 text-sm">
          <span className="w-10 shrink-0 text-right font-medium text-neutral-500">{stars}★</span>
          <div className="h-2 flex-1 rounded-full bg-neutral-100">
            <div className="h-2 rounded-full bg-brand-green-600" style={{ width: `${percentage}%` }} />
          </div>
          <span className="w-10 shrink-0 text-right text-neutral-500">{percentage}%</span>
        </div>
      ))}
    </div>
  );
}