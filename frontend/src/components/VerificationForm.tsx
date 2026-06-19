type VerificationFormProps = {
  assetName: string;
  weight: string;
  purity: string;
  loading: boolean;
  setAssetName: (value: string) => void;
  setWeight: (value: string) => void;
  setPurity: (value: string) => void;
  onVerify: () => void;
};

export default function VerificationForm({
  assetName,
  weight,
  purity,
  loading,
  setAssetName,
  setWeight,
  setPurity,
  onVerify,
}: VerificationFormProps) {
  return (
    <section className="rounded-2xl border border-line bg-vault-800/70 backdrop-blur-sm shadow-vault overflow-hidden">

      <header className="flex items-center justify-between px-6 py-4 border-b border-line">
        <span className="eyebrow">New Assay</span>
        <span className="eyebrow">Casper · Testnet</span>
      </header>

      <div className="p-6 space-y-5">

        <Field label="Asset">
          <input
            type="text"
            placeholder="e.g. 24K gold bar"
            value={assetName}
            onChange={(e) => setAssetName(e.target.value)}
            className="field"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Weight" unit="grams">
            <input
              type="number"
              inputMode="decimal"
              placeholder="0"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="field font-mono tnum"
            />
          </Field>

          <Field label="Purity" unit="%">
            <input
              type="number"
              inputMode="decimal"
              placeholder="0"
              value={purity}
              onChange={(e) => setPurity(e.target.value)}
              className="field font-mono tnum"
            />
          </Field>
        </div>

        <button
          onClick={onVerify}
          disabled={loading}
          className="group relative w-full rounded-xl py-4 font-display font-semibold text-vault-900
                     bg-gradient-to-r from-gold-400 to-gold-600
                     hover:shadow-glow disabled:opacity-60 disabled:cursor-not-allowed
                     transition-all duration-200"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-2 w-2 rounded-full bg-vault-900 animate-pulse" />
              Assaying &amp; signing to chain…
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              Run assay
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </span>
          )}
        </button>

        <p className="text-xs text-ink-faint text-center">
          Signs a Casper deploy with your wallet and writes the result on-chain.
        </p>
      </div>

      {/* Scoped input styling for the assay fields. */}
      <style>{`
        .field {
          width: 100%;
          padding: 0.85rem 1rem;
          border-radius: 0.75rem;
          background: #0E0F12;
          border: 1px solid #23262B;
          color: #ECEEF2;
          outline: none;
          transition: border-color .15s ease, box-shadow .15s ease;
        }
        .field:focus {
          border-color: rgba(246,199,68,0.55);
          box-shadow: 0 0 0 3px rgba(246,199,68,0.10);
        }
        .field::-webkit-outer-spin-button,
        .field::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
      `}</style>
    </section>
  );
}

function Field({
  label,
  unit,
  children,
}: {
  label: string;
  unit?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="flex items-center justify-between mb-2">
        <span className="eyebrow">{label}</span>
        {unit && <span className="font-mono text-[10px] text-ink-faint">{unit}</span>}
      </span>
      {children}
    </label>
  );
}
