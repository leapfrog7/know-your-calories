function BackupReminder({ lastBackupAt, onBackup, onSnooze }) {
  const lastBackupDate = lastBackupAt ? new Date(lastBackupAt) : null;
  const hasValidBackupDate =
    lastBackupDate && Number.isFinite(lastBackupDate.getTime());

  return (
    <section
      aria-labelledby="backup-reminder-title"
      className="rounded-3xl border border-amber-200 bg-amber-50 p-4 shadow-sm"
    >
      <div className="flex items-start gap-3">
        <div
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-lg shadow-sm"
        >
          ↓
        </div>

        <div className="min-w-0 flex-1">
          <p
            id="backup-reminder-title"
            className="font-black text-slate-950"
          >
            Time to back up your data
          </p>

          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            {hasValidBackupDate
              ? `Last backup: ${lastBackupDate.toLocaleDateString()}. `
              : "You have not backed up this device yet. "}
            Your meal data is stored only on this device.
          </p>

          <div className="mt-3 flex flex-col gap-2 min-[380px]:flex-row">
            <button
              type="button"
              onClick={onBackup}
              className="rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-black text-white shadow-sm outline-none transition active:scale-[0.98] focus-visible:ring-4 focus-visible:ring-amber-300"
            >
              Download backup
            </button>

            <button
              type="button"
              onClick={onSnooze}
              className="rounded-2xl border border-amber-300 bg-white px-4 py-2.5 text-sm font-black text-amber-800 shadow-sm outline-none transition active:scale-[0.98] focus-visible:ring-4 focus-visible:ring-amber-300"
            >
              Remind me tomorrow
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default BackupReminder;
