const fs = require("fs");
const { fetchContributions, calculateStats, USERNAME } = require("./fetchData");

function generatePowerJSON(stats) {
  const {
    totalContributions,
    currentStreak,
    maxStreak,
    weeklyTotal,
    level,
    levelTitle,
    xp,
    xpProgress,
    eliteMode,
  } = stats;

  // Calculate power level (0-100)
  const basePower = Math.min(50, totalContributions / 100);
  const streakPower = Math.min(30, currentStreak);
  const weeklyPower = Math.min(20, weeklyTotal * 2);
  const powerLevel = Math.min(100, Math.round(basePower + streakPower + weeklyPower));

  // Determine power class
  let powerClass = "Novice";
  let powerColor = "#888888";
  if (powerLevel >= 90) {
    powerClass = "LEGENDARY";
    powerColor = "#ffd700";
  } else if (powerLevel >= 75) {
    powerClass = "Master";
    powerColor = "#ff00ff";
  } else if (powerLevel >= 60) {
    powerClass = "Expert";
    powerColor = "#00ffff";
  } else if (powerLevel >= 45) {
    powerClass = "Advanced";
    powerColor = "#00ff00";
  } else if (powerLevel >= 30) {
    powerClass = "Intermediate";
    powerColor = "#7f00ff";
  }

  // Badges earned
  const badges = [];
  if (totalContributions >= 100) badges.push({ name: "Century Coder", icon: "💯" });
  if (totalContributions >= 500) badges.push({ name: "Commit Master", icon: "🎯" });
  if (totalContributions >= 1000) badges.push({ name: "Code Warrior", icon: "⚔️" });
  if (totalContributions >= 5000) badges.push({ name: "Architect Supreme", icon: "🏛️" });
  if (currentStreak >= 7) badges.push({ name: "Weekly Warrior", icon: "📅" });
  if (currentStreak >= 30) badges.push({ name: "Monthly Legend", icon: "🌙" });
  if (currentStreak >= 100) badges.push({ name: "Centurion", icon: "🏆" });
  if (maxStreak >= 50) badges.push({ name: "Streak Champion", icon: "🔥" });
  if (eliteMode) badges.push({ name: "Elite Engineer", icon: "🚀" });

  // Predictions (simple heuristic)
  const avgDaily = totalContributions / 365;
  const predictedWeekly = Math.round(avgDaily * 7);
  const predictedMonthly = Math.round(avgDaily * 30);

  const powerData = {
    timestamp: new Date().toISOString(),
    user: USERNAME,
    stats: {
      totalContributions,
      currentStreak,
      maxStreak,
      weeklyTotal,
    },
    power: {
      level: powerLevel,
      class: powerClass,
      color: powerColor,
      breakdown: {
        base: Math.round(basePower),
        streak: Math.round(streakPower),
        weekly: Math.round(weeklyPower),
      },
    },
    gamification: {
      level,
      title: levelTitle,
      xp,
      xpProgress: Math.round(xpProgress),
      badges,
    },
    predictions: {
      estimatedWeeklyCommits: predictedWeekly,
      estimatedMonthlyCommits: predictedMonthly,
      trend: weeklyTotal >= predictedWeekly ? "📈 Above Average" : "📉 Below Average",
    },
    eliteMode,
  };

  return powerData;
}

function generatePowerSVG(stats) {
  const powerData = generatePowerJSON(stats);
  const { power, gamification, eliteMode } = powerData;

  const colors = {
    background: "#0d1117",
    primary: power.color,
    secondary: "#00ffff",
    text: "#ffffff",
  };

  // Power meter arc
  const centerX = 150;
  const centerY = 140;
  const radius = 80;
  const startAngle = -135;
  const endAngle = 135;
  const totalAngle = endAngle - startAngle;
  const currentAngle = startAngle + (totalAngle * power.level) / 100;

  function polarToCartesian(cx, cy, r, angleInDegrees) {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(angleInRadians),
      y: cy + r * Math.sin(angleInRadians),
    };
  }

  function describeArc(cx, cy, r, startAngle, endAngle) {
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
  }

  const bgArc = describeArc(centerX, centerY, radius, startAngle, endAngle);
  const powerArc = describeArc(centerX, centerY, radius, startAngle, currentAngle);

  // Badges display
  let badgesDisplay = "";
  gamification.badges.slice(0, 6).forEach((badge, idx) => {
    const x = 320 + (idx % 3) * 100;
    const y = 80 + Math.floor(idx / 3) * 50;
    badgesDisplay += `
      <g transform="translate(${x}, ${y})">
        <rect x="-35" y="-15" width="70" height="35" rx="5" fill="rgba(255,255,255,0.1)" stroke="${colors.primary}" stroke-width="1"/>
        <text x="0" y="5" text-anchor="middle" font-size="16">${badge.icon}</text>
        <text x="0" y="20" text-anchor="middle" fill="${colors.text}" font-size="7" font-family="monospace">${badge.name}</text>
      </g>`;
  });

  // Level display
  const levelDisplay = `
    <g transform="translate(700, 80)">
      <rect x="-60" y="-30" width="150" height="80" rx="10" fill="rgba(0,0,0,0.5)" stroke="${colors.primary}" stroke-width="2"/>
      <text x="15" y="-5" text-anchor="middle" fill="${colors.primary}" font-size="28" font-family="monospace" font-weight="bold">
        LV.${gamification.level}
      </text>
      <text x="15" y="20" text-anchor="middle" fill="${colors.text}" font-size="10" font-family="monospace">
        ${gamification.title}
      </text>
      <rect x="-45" y="30" width="120" height="10" rx="5" fill="rgba(255,255,255,0.2)"/>
      <rect x="-45" y="30" width="${gamification.xpProgress * 1.2}" height="10" rx="5" fill="${colors.secondary}">
        <animate attributeName="width" values="${gamification.xpProgress * 1.1};${gamification.xpProgress * 1.2};${gamification.xpProgress * 1.1}" dur="2s" repeatCount="indefinite"/>
      </rect>
      <text x="15" y="55" text-anchor="middle" fill="${colors.text}" font-size="8" font-family="monospace">
        XP: ${gamification.xpProgress}%
      </text>
    </g>`;

  // Stats panel
  const statsPanel = `
    <g transform="translate(50, 230)">
      <rect x="0" y="0" width="800" height="40" rx="8" fill="rgba(0,0,0,0.4)" stroke="${colors.primary}" stroke-width="1"/>
      <text x="30" y="25" fill="${colors.text}" font-size="11" font-family="monospace">
        📊 ${stats.totalContributions} commits
      </text>
      <text x="200" y="25" fill="${colors.text}" font-size="11" font-family="monospace">
        🔥 ${stats.currentStreak} day streak
      </text>
      <text x="370" y="25" fill="${colors.text}" font-size="11" font-family="monospace">
        🏆 ${stats.maxStreak} max streak
      </text>
      <text x="540" y="25" fill="${colors.text}" font-size="11" font-family="monospace">
        📈 ${stats.weeklyTotal} this week
      </text>
      <text x="700" y="25" fill="${eliteMode ? "#ffd700" : colors.secondary}" font-size="11" font-family="monospace">
        ${eliteMode ? "🚀 ELITE MODE" : "⚡ ACTIVE"}
      </text>
    </g>`;

  return `<svg width="900" height="280" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="powerBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0d1117"/>
      <stop offset="100%" stop-color="#161b22"/>
    </linearGradient>
    <filter id="powerGlow">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <rect width="100%" height="100%" fill="url(#powerBg)"/>

  <!-- Title -->
  <text x="450" y="30" text-anchor="middle" fill="${colors.primary}" font-size="18"
        font-family="monospace" font-weight="bold" filter="url(#powerGlow)">
    ⚡ POWER LEVEL METER
  </text>

  <!-- Power meter arc background -->
  <path d="${bgArc}" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="15" stroke-linecap="round"/>

  <!-- Power meter arc active -->
  <path d="${powerArc}" fill="none" stroke="${colors.primary}" stroke-width="15" stroke-linecap="round" filter="url(#powerGlow)">
    <animate attributeName="stroke-opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite"/>
  </path>

  <!-- Power level display -->
  <text x="${centerX}" y="${centerY - 10}" text-anchor="middle" fill="${colors.primary}" font-size="36"
        font-family="monospace" font-weight="bold" filter="url(#powerGlow)">
    ${power.level}
  </text>
  <text x="${centerX}" y="${centerY + 15}" text-anchor="middle" fill="${colors.text}" font-size="12" font-family="monospace">
    POWER
  </text>
  <text x="${centerX}" y="${centerY + 35}" text-anchor="middle" fill="${colors.primary}" font-size="14"
        font-family="monospace" font-weight="bold">
    ${power.class}
  </text>

  <!-- Badges section header -->
  <text x="400" y="55" text-anchor="middle" fill="${colors.secondary}" font-size="12" font-family="monospace">
    🏅 BADGES EARNED
  </text>

  <!-- Badges -->
  ${badgesDisplay}

  <!-- Level display -->
  ${levelDisplay}

  <!-- Stats panel -->
  ${statsPanel}

</svg>`;
}

async function main() {
  try {
    const calendar = await fetchContributions();
    const stats = calculateStats(calendar);

    // Generate power JSON
    const powerData = generatePowerJSON(stats);
    fs.writeFileSync("output/power-meter.json", JSON.stringify(powerData, null, 2));
    console.log("✅ Power Meter JSON generated successfully!");

    // Generate power SVG
    const svg = generatePowerSVG(stats);
    fs.writeFileSync("output/power-meter.svg", svg);
    console.log("✅ Power Meter SVG generated successfully!");

    return stats;
  } catch (error) {
    console.error("❌ Error generating power meter:", error.message);
    process.exit(1);
  }
}

module.exports = { generatePowerJSON, generatePowerSVG };

if (require.main === module) {
  main();
}
