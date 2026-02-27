const HeroBackground = () => {
  // Lightweight CSS-animated network nodes
  const nodes = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    cx: 5 + (i % 6) * 18 + (Math.random() * 8 - 4),
    cy: 10 + Math.floor(i / 6) * 35 + (Math.random() * 10 - 5),
    r: 2 + Math.random() * 2,
    delay: Math.random() * 3,
  }));

  const connections: { x1: number; y1: number; x2: number; y2: number; delay: number }[] = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].cx - nodes[j].cx;
      const dy = nodes[i].cy - nodes[j].cy;
      if (Math.sqrt(dx * dx + dy * dy) < 30) {
        connections.push({
          x1: nodes[i].cx,
          y1: nodes[i].cy,
          x2: nodes[j].cx,
          y2: nodes[j].cy,
          delay: Math.random() * 2,
        });
      }
    }
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg className="w-full h-full opacity-20 dark:opacity-15" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        {connections.map((c, i) => (
          <line
            key={`l-${i}`}
            x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2}
            stroke="hsl(var(--primary))"
            strokeWidth="0.3"
            className="animate-pulse-glow"
            style={{ animationDelay: `${c.delay}s` }}
          />
        ))}
        {nodes.map((n) => (
          <circle
            key={`n-${n.id}`}
            cx={n.cx} cy={n.cy} r={n.r}
            fill="hsl(var(--primary))"
            className="animate-pulse-glow"
            style={{ animationDelay: `${n.delay}s` }}
          />
        ))}
        {/* Bridge arc */}
        <path
          d="M10 70 Q50 20 90 70"
          fill="none"
          stroke="hsl(var(--accent))"
          strokeWidth="0.5"
          className="animate-pulse-glow"
          style={{ animationDelay: "0.5s" }}
        />
      </svg>
    </div>
  );
};

export default HeroBackground;
