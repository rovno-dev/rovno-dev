export default function ICChip() {
  return (
    <div className="relative z-30 group mb-16 w-[80%] sm:w-[300px] mx-auto">
      <div className="absolute -left-4 top-1/2 -translate-y-1/2 flex flex-col gap-4">
        {[...Array(3)].map((_, i) => <div key={i} className="w-4 h-2 bg-gradient-to-r from-(--on-bg-low) to-(--on-bg-medium) rounded-l-sm border-y border-(--outline)" />)}
      </div>
      <div className="absolute -right-4 top-1/2 -translate-y-1/2 flex flex-col gap-4">
        {[...Array(3)].map((_, i) => <div key={i} className="w-4 h-2 bg-gradient-to-l from-(--on-bg-low) to-(--on-bg-medium) rounded-r-sm border-y border-(--outline)" />)}
      </div>
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex gap-5">
        {[...Array(5)].map((_, i) => <div key={i} className="w-2 h-4 bg-gradient-to-b from-(--on-bg-low) to-(--on-bg-medium) rounded-t-sm border-x border-(--outline)" />)}
      </div>
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-5">
        {[...Array(5)].map((_, i) => <div key={i} className="w-2 h-4 bg-gradient-to-t from-(--on-bg-low) to-(--on-bg-medium) rounded-b-sm border-x border-(--outline)" />)}
      </div>

      <div className="relative bg-(--card) border-2 border-(--outline) rounded-xl px-12 py-8 shadow-[0_20px_60px_var(--primary-glass)] ring-1 ring-(--outline)">
        <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-black/50 border border-white/5 shadow-inner" />
        <h2 className="text-display-2 text-center">
          Наши услуги
        </h2>
      </div>
    </div>
  );
}
