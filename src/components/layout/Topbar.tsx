"use client";

export default function Topbar({
  onMenuClick,
  user = { name: "Ops Staff", role: "Administrator" },
}: {
  onMenuClick: () => void;
  user?: { name: string; role: string };
}) {
  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");

  return (
    <header className="sticky top-0 z-30 flex h-(--spacing-topbar) items-center gap-x-4 border-b border-gray-300 bg-white/90 px-4 backdrop-blur lg:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open navigation"
        className="btn btn-ghost btn-icon lg:hidden"
      >
        <i className="hgi hgi-stroke hgi-menu-01 text-xl" />
      </button>

      <label className="hidden max-w-md flex-1 items-center gap-x-2 rounded-[0.625rem] border border-gray-300 bg-white px-3 focus-within:border-primary md:flex">
        <i className="hgi hgi-stroke hgi-search-01 shrink-0 text-lg leading-none text-gray-500" />
        <input
          type="search"
          placeholder="Search orders, products, customers…"
          aria-label="Search"
          className="w-full border-0 bg-transparent py-2.5 text-sm text-light-primary-text outline-none placeholder:text-light-disabled-text"
        />
      </label>

      <div className="ml-auto flex items-center gap-x-2">
        <button type="button" className="btn btn-ghost btn-icon relative" aria-label="Notifications">
          <i className="hgi hgi-stroke hgi-notification-02 text-xl" />
          <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-error" />
        </button>

        <div className="ml-1 flex items-center gap-x-3 border-l border-gray-300 pl-3">
          <div className="hidden text-right sm:block">
            <p className="text-[13px] leading-tight font-semibold text-light-primary-text">
              {user.name}
            </p>
            <p className="text-xs text-light-disabled-text">{user.role}</p>
          </div>
          <span className="grid size-9 place-items-center rounded-full bg-primary text-sm font-semibold text-white">
            {initials}
          </span>
        </div>
      </div>
    </header>
  );
}
