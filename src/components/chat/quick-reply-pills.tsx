type QuickReplyPillsProps = {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
};

export function QuickReplyPills({ suggestions, onSelect }: QuickReplyPillsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {suggestions.map((suggestion) => (
        <button
          key={suggestion}
          className="whitespace-nowrap rounded-full bg-brand-green-100 px-3 py-2 text-xs font-medium text-brand-green-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-green-200"
          onClick={() => onSelect(suggestion)}
          type="button"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
}