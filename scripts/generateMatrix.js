const fs = require("fs");
const { fetchContributions, calculateStats } = require("./fetchData");

function generateMatrixSVG(stats) {
  const { totalContributions, currentStreak, maxStreak, level, levelTitle, xpProgress, eliteMode, weeklyTotal } = stats;

  const colors = {
    primary: "#00ff00",
    secondary: "#00cc00",
    accent: "#00ffff",
    terminal: "#33ff33",
    dark: "#001100",
  };

  let matrixRain = "";
  let gridLines = "";
  let terminalText = "";

  // Matrix rain effect
  const chars = "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン".split("");
  const columns = 45;

  for (let i = 0; i < columns; i++) {
    const x = i * 20 + 10;
    const speed = 2 + Math.random() * 4;
    const delay = Math.random() * 5;
    const length = 5 + Math.floor(Math.random() * 8);

    for (let j = 0; j < length; j++) {
      const char = chars[Math.floor(Math.random() * chars.length)];
      const y = j * 20;
      const opacity = 1 - (j / length) * 0.7;

      matrixRain += `
        <text x="${x}" y="${y}" fill="${j === 0 ? colors.accent : colors.primary}"
              font-size="14" font-family="monospace" opacity="${opacity * 0.4}">
          ${char}
          <animate attributeName="y" values="${y};${y + 280};${y}" dur="${speed}s"
                   begin="${delay}s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0;${opacity * 0.5};0" dur="${speed}s"
                   begin="${delay}s" repeatCount="indefinite"/>
        </text>`;
    }
  }

  // Neon grid
  for (let i = 0; i <= 18; i++) {
    const x = i * 50;
    gridLines += `
      <line x1="${x}" y1="0" x2="${x}" y2="280" stroke="${colors.primary}" stroke-width="0.3" opacity="0.15">
        <animate attributeName="opacity" values="0.1;0.2;0.1" dur="3s" repeatCount="indefinite"/>
      </line>`;
  }
  for (let i = 0; i <= 6; i++) {
    const y = i * 50;
    gridLines += `
      <line x1="0" y1="${y}" x2="900" y2="${y}" stroke="${colors.primary}" stroke-width="0.3" opacity="0.15">
        <animate attributeName="opacity" values="0.1;0.2;0.1" dur="3s" repeatCount="indefinite"/>
      </line>`;
  }

  // Terminal window
  const terminalX = 50;
  const terminalY = 60;
  const terminalWidth = 800;
  const terminalHeight = 180;

  const terminal = `
    <!-- Terminal window -->
    <rect x="${terminalX}" y="${terminalY}" width="${terminalWidth}" height="${terminalHeight}"
          fill="rgba(0,10,0,0.85)" rx="8" stroke="${colors.primary}" stroke-width="2"/>

    <!-- Terminal header -->
    <rect x="${terminalX}" y="${terminalY}" width="${terminalWidth}" height="25"
          fill="rgba(0,30,0,0.9)" rx="8"/>
    <rect x="${terminalX}" y="${terminalY + 15}" width="${terminalWidth}" height="12"
          fill="rgba(0,30,0,0.9)"/>

    <!-- Window buttons -->
    <circle cx="${terminalX + 20}" cy="${terminalY + 12}" r="5" fill="#ff5f56"/>
    <circle cx="${terminalX + 40}" cy="${terminalY + 12}" r="5" fill="#ffbd2e"/>
    <circle cx="${terminalX + 60}" cy="${terminalY + 12}" r="5" fill="#27c93f"/>

    <!-- Terminal title -->
    <text x="${terminalX + terminalWidth / 2}" y="${terminalY + 17}" text-anchor="middle"
          fill="${colors.terminal}" font-size="12" font-family="monospace">
      contribution_engine.sh — SYSTEM MONITOR
    </text>

    <!-- Terminal content -->
    <text x="${terminalX + 15}" y="${terminalY + 50}" fill="${colors.primary}" font-size="11" font-family="monospace">
      <tspan>$ ./stats --user kulkarnishub377</tspan>
    </text>

    <text x="${terminalX + 15}" y="${terminalY + 70}" fill="${colors.terminal}" font-size="11" font-family="monospace">
      <tspan>[SYSTEM] Loading contribution data...</tspan>
      <animate attributeName="opacity" values="0.5;1;0.5" dur="1s" repeatCount="indefinite"/>
    </text>

    <text x="${terminalX + 15}" y="${terminalY + 95}" fill="${colors.accent}" font-size="12" font-family="monospace" font-weight="bold">
      ╔════════════════════════════════════════════════════════════════════════╗
    </text>

    <text x="${terminalX + 15}" y="${terminalY + 112}" fill="${colors.accent}" font-size="12" font-family="monospace">
      ║  📊 TOTAL COMMITS: ${String(totalContributions).padEnd(8)} │ 🔥 STREAK: ${String(currentStreak).padEnd(4)} │ 🏆 MAX: ${String(maxStreak).padEnd(4)} ║
    </text>

    <text x="${terminalX + 15}" y="${terminalY + 130}" fill="${colors.accent}" font-size="12" font-family="monospace">
      ║  ⚡ LEVEL: ${String(level).padEnd(2)} (${levelTitle.padEnd(18)}) │ 📈 WEEKLY: ${String(weeklyTotal).padEnd(6)}     ║
    </text>

    <text x="${terminalX + 15}" y="${terminalY + 147}" fill="${colors.accent}" font-size="12" font-family="monospace" font-weight="bold">
      ╚════════════════════════════════════════════════════════════════════════╝
    </text>

    <text x="${terminalX + 15}" y="${terminalY + 167}" fill="${eliteMode ? "#ffd700" : colors.primary}" font-size="11" font-family="monospace">
      [STATUS] ${eliteMode ? "🏆 ELITE ENGINEER MODE ACTIVATED" : "System operational. All metrics nominal."}
      <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite"/>
    </text>
  `;

  // Blinking cursor
  const cursor = `
    <rect x="${terminalX + 15}" y="${terminalY + 172}" width="8" height="2" fill="${colors.terminal}">
      <animate attributeName="opacity" values="1;0;1" dur="1s" repeatCount="indefinite"/>
    </rect>
  `;

  // XP progress bar
  const xpBar = `
    <rect x="50" y="250" width="800" height="20" fill="rgba(0,20,0,0.8)" rx="10" stroke="${colors.primary}" stroke-width="1"/>
    <rect x="52" y="252" width="${Math.max(4, xpProgress * 7.96)}" height="16" fill="${colors.accent}" rx="8" opacity="0.8">
      <animate attributeName="opacity" values="0.6;0.9;0.6" dur="2s" repeatCount="indefinite"/>
    </rect>
    <text x="450" y="264" text-anchor="middle" fill="${colors.terminal}" font-size="10" font-family="monospace">
      XP: ${Math.round(xpProgress)}% TO NEXT LEVEL
    </text>
  `;

  // Title
  const title = `
    <text x="450" y="35" text-anchor="middle" fill="${colors.accent}" font-size="18"
          font-family="monospace" font-weight="bold">
      🌌 CYBERPUNK MATRIX SYSTEM
      <animate attributeName="fill" values="${colors.accent};${colors.primary};${colors.accent}" dur="4s" repeatCount="indefinite"/>
    </text>
  `;

  return `<svg width="900" height="280" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="matrixBg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#000800"/>
      <stop offset="100%" stop-color="#001000"/>
    </linearGradient>
    <filter id="matrixGlow">
      <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <rect width="100%" height="100%" fill="url(#matrixBg)"/>

  <!-- Grid lines -->
  ${gridLines}

  <!-- Matrix rain -->
  ${matrixRain}

  <!-- Title -->
  <g filter="url(#matrixGlow)">
    ${title}
  </g>

  <!-- Terminal -->
  ${terminal}
  ${cursor}

  <!-- XP Bar -->
  ${xpBar}

</svg>`;
}

async function main() {
  try {
    const calendar = await fetchContributions();
    const stats = calculateStats(calendar);
    const svg = generateMatrixSVG(stats);
    fs.writeFileSync("output/matrix-layer.svg", svg);
    console.log("✅ Matrix Layer SVG generated successfully!");
    return stats;
  } catch (error) {
    console.error("❌ Error generating matrix layer:", error.message);
    process.exit(1);
  }
}

module.exports = { generateMatrixSVG };

if (require.main === module) {
  main();
}
