export default function StatCard({
  label,
  value,
  change,
  icon,
  tone = "primary",
  hint,
}: {
  label: string;
  value: string;
  change?: number;
  icon: string;
  tone?: "primary" | "secondary" | "success" | "warning" | "error" | "info";
  hint?: string;
}) {
  const tones: Record<string, string> = {
    primary: "bg-primary-lighter text-primary-darker",
    secondary: "bg-warning-lighter text-warning-dark",
    success: "bg-success-lighter text-success-dark",
    warning: "bg-warning-lighter text-warning-dark",
    error: "bg-error-lighter text-error-dark",
    info: "bg-info-lighter text-info-dark",
  };

  return (
    <div className="card card-body flex items-start gap-x-4">
      <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${tones[tone]}`}>
        <i className={`hgi hgi-stroke ${icon} text-xl`} />
      </span>
      <div className="min-w-0">
        <p className="text-[13px] text-light-disabled-text">{label}</p>
        <p className="mt-0.5 font-urbanist text-2xl font-bold text-light-primary-text tabular-nums">
          {value}
        </p>
        {change !== undefined ? (
          <p
            className={`mt-1 inline-flex items-center gap-x-1 text-xs font-semibold ${
              change >= 0 ? "text-success-dark" : "text-error"
            }`}
          >
            <i
              className={`hgi hgi-stroke ${
                change >= 0 ? "hgi-arrow-up-right-01" : "hgi-arrow-down-right-01"
              } text-sm`}
            />
            {Math.abs(change)}%
            <span className="font-normal text-light-disabled-text">vs last period</span>
          </p>
        ) : null}
        {hint ? <p className="mt-1 text-xs text-light-disabled-text">{hint}</p> : null}
      </div>
    </div>
  );
}
