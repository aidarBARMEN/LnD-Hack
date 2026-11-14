import type { ReactNode } from "react";

export function BrandMark() {
  return (
    <svg viewBox="0 0 56 56" fill="none" aria-hidden="true" focusable="false">
      <rect width="56" height="56" rx="19" fill="#087d63" />
      <path
        d="M16 34V24a8 8 0 0 1 16 0v10"
        stroke="#FFFDF8"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M24 34V24a8 8 0 0 1 16 0v10"
        stroke="#63e6c7"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M16 34c6 7 18 7 24 0"
        stroke="#FFFDF8"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export type IconName =
  | "community"
  | "home"
  | "child"
  | "heart"
  | "plan"
  | "shield"
  | "flower"
  | "book"
  | "center"
  | "person";
export function LineIcon({
  name,
  className = "",
}: {
  name: IconName;
  className?: string;
}) {
  const paths: Record<IconName, ReactNode> = {
    community: (
      <>
        <path d="M4 4h16v12H9l-5 4V4Z" />
        <path d="M8 8h8M8 12h5" />
      </>
    ),
    home: (
      <>
        <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z" />
        <path d="M9 21v-8h6v8" />
      </>
    ),
    child: (
      <>
        <circle cx="12" cy="7" r="3" />
        <path d="M6 21v-3a6 6 0 0 1 12 0v3M4 12l4 3m12-3-4 3" />
      </>
    ),
    heart: (
      <path d="M20.8 5.7a5.5 5.5 0 0 0-8.8 0 5.5 5.5 0 0 0-8.8 6.5L12 21l8.8-8.8a5.5 5.5 0 0 0 0-6.5Z" />
    ),
    plan: (
      <>
        <rect x="5" y="4" width="15" height="17" rx="3" />
        <path d="M9 2v4m7-4v4m-7 5 1 1 2-2m2 1h3m-8 5 1 1 2-2m2 1h3" />
      </>
    ),
    shield: (
      <>
        <path d="m12 2 8 3v6c0 5-8 10-8 10S4 16 4 11V5Z" />
        <path d="m8 11 3 3 5-6" />
      </>
    ),
    flower: (
      <>
        <path d="M12 12c-9-2-8-9-4-9 3 0 4 4 4 9Zm0 0c2-9 9-8 9-4 0 3-4 4-9 4Zm0 0c9 2 8 9 4 9-3 0-4-4-4-9Zm0 0c-2 9-9 8-9 4 0-3 4-4 9-4Z" />
        <circle cx="12" cy="12" r="2" />
      </>
    ),
    book: (
      <>
        <path d="M12 5c-3-3-7-2-10-1v15c4-1 7-1 10 1 3-2 6-2 10-1V4c-3-1-7-2-10 1Z" />
        <path d="M12 5v15" />
      </>
    ),
    center: (
      <>
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="M8 7h1m6 0h1m-8 4h1m6 0h1m-6 10v-6h4v6" />
      </>
    ),
    person: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 22v-2a8 8 0 0 1 16 0v2" />
      </>
    ),
  };
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {paths[name]}
    </svg>
  );
}

export function FamilyIllustration({ compact = false }: { compact?: boolean }) {
  return (
    <svg
      viewBox="0 0 320 220"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={compact ? "compact-family" : "family-illustration"}
    >
      <ellipse cx="167" cy="184" rx="125" ry="18" fill="#d2e8ff" />
      <path
        d="M45 169C25 90 72 29 153 26c83-3 137 56 117 143Z"
        fill="#dcecff"
      />
      <circle cx="137" cy="77" r="24" fill="#E4B9A6" />
      <path
        d="M111 75c-4-30 32-41 49-18l4 20-13-6-4-15c-10 14-21 19-36 19Z"
        fill="#283d5d"
      />
      <path
        d="M89 180v-48c0-29 17-45 45-45 27 0 48 20 48 45v48Z"
        fill="#3a86ec"
      />
      <circle cx="197" cy="120" r="18" fill="#E8C5AF" />
      <path
        d="M178 119c-4-23 29-29 37-10l1 11-10-7c-9 8-18 8-28 6Z"
        fill="#6E5B50"
      />
      <path
        d="M166 181v-28c0-19 13-29 30-29 18 0 32 12 32 29v28Z"
        fill="#22b896"
      />
      <path
        d="M119 128c9 38 27 54 63 37"
        stroke="#E4B9A6"
        strokeWidth="15"
        strokeLinecap="round"
      />
      <path
        d="M208 150c-13 14-31 16-43 4"
        stroke="#E8C5AF"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path d="M63 166c-5-15-1-30 8-37 4 14 2 26-8 37Z" fill="#43c0a2" />
      <path d="M62 167c-13-6-20-17-17-30 12 5 18 15 17 30Z" fill="#BBC9AE" />
      <path d="M255 99c-2-16 4-27 15-32 2 13-3 24-15 32Z" fill="#B6C9AB" />
      <path d="m247 54 3-8 3 8 8 3-8 3-3 8-3-8-8-3Z" fill="#C29F6D" />
      {!compact && (
        <>
          <circle cx="74" cy="60" r="4" fill="#BEA7CD" />
          <circle cx="276" cy="146" r="5" fill="#D7B5A1" />
        </>
      )}
    </svg>
  );
}

export function MotherIllustration() {
  return (
    <svg viewBox="0 0 180 170" fill="none" aria-hidden="true" focusable="false">
      <circle cx="92" cy="83" r="69" fill="#ffebbc" />
      <path
        d="M72 147c-17-19-14-49 9-58l40-8c21 14 26 44 9 66Z"
        fill="#f2ac38"
      />
      <circle cx="99" cy="59" r="20" fill="#E8BFA9" />
      <path
        d="M77 60C66 35 97 18 116 37l9 29-17-6-4-18c-6 12-15 19-27 18Z"
        fill="#394757"
      />
      <path d="m51 94 34 6 33-5-7 34-31 8-30-12Z" fill="#FFF9EC" />
      <path d="m85 101-5 36" stroke="#D4C29F" strokeWidth="2" />
      <path
        d="M75 94c-18 8-20 18-10 24m59-26c17 5 18 18 3 22"
        stroke="#E8BFA9"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path d="M34 80c-11-18-7-34 4-43 9 17 7 30-4 43Z" fill="#70cfb7" />
      <path d="M35 81c-13-5-20-14-19-26 13 1 20 11 19 26Z" fill="#D1DDC9" />
      <path d="m144 38 3-7 3 7 7 3-7 3-3 7-3-7-7-3Z" fill="#C6AA7F" />
    </svg>
  );
}
