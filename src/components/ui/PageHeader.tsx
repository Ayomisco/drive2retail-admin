import type { ReactNode } from "react";

export default function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1>{title}</h1>
        {description ? (
          <p className="mt-1 text-light-secondary-text">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex items-center gap-x-2">{actions}</div> : null}
    </div>
  );
}
