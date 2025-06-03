export const generateBitPattern = (inputString) => {
  const size = 5;
  // hash function to generate a deterministic number from the string
  let hash = 0;
  for (let i = 0; i < inputString.length; i++) {
    hash = (hash * 31 + inputString.charCodeAt(i)) & 0x7fffffff;
  }

  // Use hash as a seed for RNG
  const seededRandom = () => {
    hash = (hash * 1664525 + 1013904223) & 0x7fffffff;
    return hash / 0x7fffffff;
  };

  let bits = [];
  for (let i = 0; i < size; i++) {
    const row = [];
    for (let j = 0; j < Math.ceil(size / 2); j++) {
      row.push(seededRandom() > 0.5);
    }
    // Mirror horizontally for symmetry
    const mirrored = [...row, ...row.slice(0, size % 2 === 0 ? row.length : row.length - 1).reverse()];
    bits.push(mirrored);
  }
  return bits;
};

export const BitIdenticon = ({ size = 40, pattern }) => {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        overflow: "hidden",
        backgroundColor: "#1e293b",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 1,
          width: "80%",
          height: "80%",
        }}
      >
        {pattern.flat().map((on, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: on ? "#f8fafc" : "transparent",
              width: "100%",
              aspectRatio: "1 / 1",
            }}
          />
        ))}
      </div>
    </div>
  );
};