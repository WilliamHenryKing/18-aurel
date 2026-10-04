type IconName = "diagonal" | "down" | "left" | "right" | "menu" | "close" | "sun" | "moon";

/** Original stroke geometry. Keep icon weight and optical size consistent across the site. */
export default function Icon({ name = "diagonal" }: { name?: IconName }) {
  return (
    <svg
      className="ui-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {name === "diagonal" && <path d="M5 19 19 5M5 5h14v14" />}
      {name === "down" && <path d="M12 4v16m-6-6 6 6 6-6" />}
      {name === "left" && <path d="M20 12H4m6-6-6 6 6 6" />}
      {name === "right" && <path d="M4 12h16m-6-6 6 6-6 6" />}
      {name === "menu" && <path d="M4 8h16M4 16h16" />}
      {name === "close" && <path d="m6 6 12 12M18 6 6 18" />}
      {name === "sun" && (
        <>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
        </>
      )}
      {name === "moon" && <path d="M20.2 15.5A8.6 8.6 0 0 1 8.5 3.8a8.8 8.8 0 1 0 11.7 11.7Z" />}
    </svg>
  );
}
