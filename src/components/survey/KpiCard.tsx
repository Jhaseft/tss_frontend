type KpiCardProps = {
  label: string;
  value: string | number;
  sub?: string;
  highlight?: boolean;
};

export default function KpiCard({ label, value, sub, highlight }: KpiCardProps) {
  return (
    <div
      className={`rounded-xl border p-5 flex flex-col gap-1 ${
        highlight
          ? "bg-gray-900 border-gray-900 text-white"
          : "bg-white border-gray-200"
      }`}
    >
      <p
        className={`text-xs font-medium uppercase tracking-wider ${
          highlight ? "text-gray-400" : "text-gray-400"
        }`}
      >
        {label}
      </p>
      <p
        className={`text-2xl font-bold ${
          highlight ? "text-white" : "text-gray-900"
        }`}
      >
        {value}
      </p>
      {sub && (
        <p className={`text-xs ${highlight ? "text-gray-400" : "text-gray-500"}`}>
          {sub}
        </p>
      )}
    </div>
  );
}
