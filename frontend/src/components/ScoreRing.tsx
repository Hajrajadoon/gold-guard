type Props = {
  score: number;
};

export default function ScoreRing({ score }: Props) {
  const radius = 60;
  const stroke = 10;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset =
    circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-6">

      <svg height={radius * 2} width={radius * 2}>
        <circle
          stroke="#1f2937"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />

        <circle
          stroke={score > 80 ? "#22c55e" : score > 60 ? "#facc15" : "#ef4444"}
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + " " + circumference}
          style={{ strokeDashoffset }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          strokeLinecap="round"
        />
      </svg>

      <div className="text-center mt-2">
        <p className="text-2xl font-bold">{score}</p>
        <p className="text-xs text-slate-400">Trust Score</p>
      </div>

    </div>
  );
}