import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
      <div className="text-center space-y-6">

        <h1 className="text-5xl font-bold">
          🪙 GoldGuard AI
        </h1>

        <p className="text-slate-400">
          AI + Blockchain Gold Verification System
        </p>

        <button
          onClick={() => navigate("/app")}
          className="px-6 py-3 bg-blue-600 rounded-xl"
        >
          Enter Dashboard
        </button>

      </div>
    </div>
  );
}