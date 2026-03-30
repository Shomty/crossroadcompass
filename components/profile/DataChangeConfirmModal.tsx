"use client";

interface Props {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * FE-11 — confirm before PATCH when a profile already exists.
 */
export function DataChangeConfirmModal({ open, onConfirm, onCancel }: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(8, 6, 14, 0.75)" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="birth-change-title"
    >
      <div
        className="max-w-md rounded-lg border p-6 shadow-xl"
        style={{
          borderColor: "rgba(200,135,58,0.35)",
          background: "var(--cosmos, #0c0a12)",
          color: "var(--cream)",
        }}
      >
        <h2 id="birth-change-title" style={{ fontFamily: "Cinzel, serif", fontSize: "1.25rem", marginBottom: "0.75rem" }}>
          Update birth data
        </h2>
        <p style={{ fontSize: "0.9rem", color: "var(--mist)", lineHeight: 1.65, marginBottom: "0.75rem" }}>
          Changing your birth data will recalculate your entire chart. All existing insights and cached chart data will be
          regenerated. This cannot be undone.
        </p>
        <p style={{ fontSize: "0.85rem", color: "var(--mist)", opacity: 0.85, marginBottom: "1.25rem" }}>
          Past insights you have already read will remain in your history.
        </p>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
          <button type="button" onClick={onCancel} className="btn-ghost">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} className="btn-primary">
            Yes, update my birth data
          </button>
        </div>
      </div>
    </div>
  );
}
