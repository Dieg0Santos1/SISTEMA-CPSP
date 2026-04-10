function MetricCard({ title, value, note, helper, icon: Icon, accent, badgeTone }) {
  return (
    <article
      className={`rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_14px_40px_-30px_rgba(15,23,42,0.5)] ${accent}`}
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-700">
            {title}
          </p>
        </div>

        <div className={`rounded-2xl p-3 ${badgeTone}`}>
          <Icon size={20} strokeWidth={2.2} />
        </div>
      </div>

      <div className="flex items-end justify-between gap-4">
        <p className="text-3xl font-bold tracking-tight text-slate-950 sm:text-[2.15rem]">
          {value}
        </p>

        <div className="text-right">
          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${badgeTone}`}>
            {note}
          </span>
          <p className="mt-2 max-w-[9rem] text-xs leading-5 text-slate-500">{helper}</p>
        </div>
      </div>
    </article>
  )
}

export default MetricCard
