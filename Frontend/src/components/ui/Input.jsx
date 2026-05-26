function Input({ label, error, className = "", icon: Icon, ...props }) {
  return (
    <label className="block space-y-2">
      {label ? <span className="text-sm font-medium text-slate-300">{label}</span> : null}
      <div
        className={`flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 transition focus-within:border-cyan-400/50 focus-within:ring-4 focus-within:ring-cyan-500/10 ${className}`}
      >
        {Icon ? <Icon className="text-slate-500" /> : null}
        <input
          className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
          {...props}
        />
      </div>
      {error ? <p className="text-xs text-rose-400">{error}</p> : null}
    </label>
  );
}

export default Input;
