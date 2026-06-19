export default function TxBadge({ isOnChain }: { isOnChain: boolean }) {
  return (
    <span
      style={{
        padding: "4px 10px",
        borderRadius: "999px",
        fontSize: "12px",
        background: isOnChain ? "#14532d" : "#92400e",
        color: "white",
      }}
    >
      {isOnChain ? "ON-CHAIN (Casper)" : "OFF-CHAIN (AI)"}
    </span>
  );
}