import {
  LazyMotion,
  domAnimation,
  m,
} from "framer-motion";

const styles = {
  primary:
    "bg-cyan-500 text-slate-950 hover:bg-cyan-400 focus:ring-cyan-400/40",

  secondary:
    "bg-slate-800 text-slate-100 hover:bg-slate-700 focus:ring-slate-400/30",

  danger:
    "bg-rose-500/90 text-white hover:bg-rose-400 focus:ring-rose-400/40",

  ghost:
    "border border-white/10 bg-transparent text-slate-300 hover:bg-white/5 focus:ring-slate-400/20",
};

function Button({
  children,
  type = "button",
  variant = "primary",
  className = "",
  loading = false,
  icon: Icon,
  ...props
}) {
  return (
    <LazyMotion features={domAnimation}>
      <m.button
        whileTap={{ scale: 0.98 }}
        type={type}
        disabled={loading || props.disabled}
        className={`
          inline-flex items-center justify-center gap-2
          rounded-2xl px-4 py-2.5
          text-sm font-semibold transition
          focus:outline-none focus:ring-4
          disabled:cursor-not-allowed disabled:opacity-60
          ${styles[variant]}
          ${className}
        `}
        {...props}
      >
        {loading ? (
          <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}

        {!loading && Icon ? (
          <Icon className="text-base" />
        ) : null}

        <span>{children}</span>
      </m.button>
    </LazyMotion>
  );
}

export default Button;