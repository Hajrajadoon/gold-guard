import { ReactNode } from "react";

type StatCardProps = {
  title: string;
  value: ReactNode;
  valueColor?: string;
  subtitle?: string;
};

export default function StatCard({
  title,
  value,
  valueColor = "text-white",
  subtitle,
}: StatCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-md p-6 shadow-lg hover:border-blue-500/50 hover:shadow-blue-500/10 transition-all duration-300">

      {/* Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10">
        <p className="text-xs uppercase tracking-widest text-slate-500 font-medium">
          {title}
        </p>

        <h2 className={`mt-4 text-4xl font-bold ${valueColor}`}>
          {value}
        </h2>

        {subtitle && (
          <p className="mt-3 text-sm text-slate-400">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}