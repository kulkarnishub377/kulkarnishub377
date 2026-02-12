const fs = require("fs");
const { fetchContributions, calculateStats } = require("./fetchData");

function generateBrainSVG(stats) {
  const { weeks, totalContributions, currentStreak, maxStreak, level, levelTitle, eliteMode } = stats;

  let neurons = "";
  let connections = "";
  let pulses = "";
  let xPos = 80;

  const points = [];
  const colors = {
    primary: "#00ffff",
    secondary: "#7f00ff",
    accent: "#ff00ff",
    inactive: "#1a1a2e",
    elite: "#ffd700",
  };

  // Heartbeat speed based on streak
  const heartbeatDuration = Math.max(0.8, 3 - currentStreak * 0.05);

  // Generate neurons from contribution data
  weeks.forEach((week, weekIdx) => {
    week.contributionDays.forEach((day, dayIdx) => {
      const count = day.contributionCount;
      const glow = Math.min(count * 4, 20);
      const cy = 80 + dayIdx * 22;
      const opacity = count > 0 ? 0.5 + Math.min(count / 8, 0.5) : 0.1;

      let color = colors.inactive;
      if (count > 10) color = colors.accent;
      else if (count > 5) color = colors.primary;
      else if (count > 0) color = colors.secondary;
      if (eliteMode && count > 0) color = colors.elite;

      const dur = count > 5 ? "1s" : count > 2 ? "1.8s" : "2.5s";
      const radius = 3 + Math.min(count * 0.3, 3);

      points.push({ x: xPos, y: cy, count, color });

      neurons += `
        <circle cx="${xPos}" cy="${cy}" r="${radius}"
          fill="${color}" opacity="${opacity}" class="neuron">
          <animate attributeName="r"
                   values="${radius};${radius + glow};${radius}"
                   dur="${dur}"
                   repeatCount="indefinite" />
          <animate attributeName="opacity"
                   values="${opacity};1;${opacity}"
                   dur="${dur}"
                   repeatCount="indefinite" />
        </circle>`;
    });
    xPos += 14;
  });

  // Create synaptic connections
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const dx = points[j].x - points[i].x;
      const dy = points[j].y - points[i].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 35 && points[i].count > 0 && points[j].count > 0) {
        const strength = (points[i].count + points[j].count) / 20;
        connections += `
        <line x1="${points[i].x}" y1="${points[i].y}"
              x2="${points[j].x}" y2="${points[j].y}"
              stroke="${eliteMode ? colors.elite : colors.primary}"
              stroke-width="${Math.min(0.8, strength)}"
              opacity="0.2"
              class="synapse">
          <animate attributeName="stroke-opacity"
                   values="0.1;0.5;0.1"
                   dur="${2 + Math.random() * 2}s"
                   repeatCount="indefinite"/>
        </line>`;
      }
    }
  }

  // Central brain pulse (heartbeat)
  const centerX = 450;
  const centerY = 140;
  pulses = `
    <circle cx="${centerX}" cy="${centerY}" r="60" fill="none" stroke="${colors.primary}" stroke-width="2" opacity="0.3">
      <animate attributeName="r" values="60;100;60" dur="${heartbeatDuration}s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.3;0.6;0.3" dur="${heartbeatDuration}s" repeatCount="indefinite"/>
    </circle>
    <circle cx="${centerX}" cy="${centerY}" r="40" fill="none" stroke="${colors.secondary}" stroke-width="1.5" opacity="0.4">
      <animate attributeName="r" values="40;70;40" dur="${heartbeatDuration}s" repeatCount="indefinite"/>
    </circle>
    <circle cx="${centerX}" cy="${centerY}" r="20" fill="${colors.primary}" opacity="0.2">
      <animate attributeName="r" values="20;35;20" dur="${heartbeatDuration}s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.2;0.5;0.2" dur="${heartbeatDuration}s" repeatCount="indefinite"/>
    </circle>
  `;

  // Elite badge
  let eliteBadge = "";
  if (eliteMode) {
    eliteBadge = `
      <rect x="700" y="15" width="180" height="30" rx="15" fill="#ffd700" opacity="0.9">
        <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite"/>
      </rect>
      <text x="790" y="35" text-anchor="middle" fill="#000" font-size="12" font-family="monospace" font-weight="bold">
        🏆 ELITE ENGINEER MODE
      </text>
    `;
  }

  // Stats overlay
  const statsOverlay = `
    <text x="50" y="260" fill="${colors.primary}" font-size="11" font-family="monospace" opacity="0.9">
      TOTAL: ${totalContributions.toLocaleString()} commits
    </text>
    <text x="250" y="260" fill="${colors.secondary}" font-size="11" font-family="monospace" opacity="0.9">
      STREAK: ${currentStreak} days
    </text>
    <text x="420" y="260" fill="${colors.accent}" font-size="11" font-family="monospace" opacity="0.9">
      MAX: ${maxStreak} days
    </text>
    <text x="590" y="260" fill="${colors.primary}" font-size="11" font-family="monospace" opacity="0.9">
      LEVEL ${level}: ${levelTitle}
    </text>
  `;

  return `<svg width="900" height="280" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="brainBg" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#1a0033" />
      <stop offset="50%" stop-color="#0d0d1a" />
      <stop offset="100%" stop-color="#050510" />
    </radialGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <rect width="100%" height="100%" fill="url(#brainBg)"/>

  <!-- Grid overlay -->
  <g opacity="0.05">
    ${Array.from({ length: 18 }, (_, i) => `<line x1="${i * 50}" y1="0" x2="${i * 50}" y2="280" stroke="#00ffff" stroke-width="0.5"/>`).join("")}
    ${Array.from({ length: 6 }, (_, i) => `<line x1="0" y1="${i * 50}" x2="900" y2="${i * 50}" stroke="#00ffff" stroke-width="0.5"/>`).join("")}
  </g>

  <!-- Title -->
  <text x="450" y="25" text-anchor="middle" fill="${colors.primary}" font-size="16"
        font-family="monospace" font-weight="bold" filter="url(#glow)">
    🧠 NEURAL ACTIVITY CORE
    <animate attributeName="opacity" values="0.7;1;0.7" dur="3s" repeatCount="indefinite"/>
  </text>

  ${eliteBadge}

  <!-- Brain pulse center -->
  <g filter="url(#glow)">
    ${pulses}
  </g>

  <!-- Synaptic connections -->
  ${connections}

  <!-- Neurons -->
  <g filter="url(#glow)">
    ${neurons}
  </g>

  <!-- Stats overlay -->
  ${statsOverlay}

</svg>`;
}

async function main() {
  try {
    const calendar = await fetchContributions();
    const stats = calculateStats(calendar);
    const svg = generateBrainSVG(stats);
    fs.writeFileSync("output/brain-core.svg", svg);
    console.log("✅ Brain Core SVG generated successfully!");
    return stats;
  } catch (error) {
    console.error("❌ Error generating brain:", error.message);
    process.exit(1);
  }
}

module.exports = { generateBrainSVG };

if (require.main === module) {
  main();
}
