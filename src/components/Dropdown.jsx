import { useEffect, useRef, useState } from "react";

const Chevron = () => (
  <svg className="dd-chev" width="12" height="8" viewBox="0 0 12 8" fill="none">
    <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Check = () => (
  <svg className="dd-check" width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M2.5 7.5L5.5 10.5L11.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function Dropdown({ value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className={"dropdown" + (open ? " open" : "")} ref={ref}>
      <button
        type="button"
        className="dd-trigger"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
      >
        <span className="dd-value">{value}</span>
        <Chevron />
      </button>
      <div className="dd-menu" role="listbox">
        {options.map((opt) => (
          <div
            key={opt}
            className={"dd-option" + (opt === value ? " selected" : "")}
            onClick={(e) => {
              e.stopPropagation();
              onChange(opt);
              setOpen(false);
            }}
          >
            <span>{opt}</span>
            <Check />
          </div>
        ))}
      </div>
    </div>
  );
}
