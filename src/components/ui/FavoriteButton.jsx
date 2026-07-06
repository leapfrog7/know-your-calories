function FavoriteButton({ active, onClick, label = "Toggle favorite" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-9 w-9 items-center justify-center rounded-full text-lg shadow-sm transition active:scale-[0.95] ${
        active
          ? "bg-amber-50 text-amber-500 ring-1 ring-amber-100"
          : "bg-slate-100 text-slate-400"
      }`}
      aria-label={label}
      title={label}
    >
      {active ? "★" : "☆"}
    </button>
  );
}

export default FavoriteButton;
