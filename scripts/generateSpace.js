const fs = require("fs");
const { fetchContributions, calculateStats } = require("./fetchData");

function generateSpaceSVG(stats) {
  const { weeks, totalContributions, currentStreak, level, eliteMode } = stats;

  const colors = {
    ship: "#00ffff",
    laser: "#ff00ff",
    enemy: "#ff6b6b",
    boss: "#ffd700",
    star: "#ffffff",
    explosion: "#ff9500",
  };

  let enemies = "";
  let lasers = "";
  let explosions = "";
  let stars = "";

  // Generate starfield background
  for (let i = 0; i < 80; i++) {
    const x = Math.random() * 900;
    const y = Math.random() * 280;
    const size = Math.random() * 1.5 + 0.5;
    const delay = Math.random() * 3;
    stars += `
      <circle cx="${x}" cy="${y}" r="${size}" fill="${colors.star}" opacity="0.6">
        <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" begin="${delay}s" repeatCount="indefinite"/>
      </circle>`;
  }

  // Ship position moves based on weekly progress
  let shipX = 70;
  const shipY = 140;

  // Generate enemies (contributions as targets)
  const lastWeeks = weeks.slice(-12); // Last 12 weeks
  let enemyX = 150;

  lastWeeks.forEach((week, weekIdx) => {
    week.contributionDays.forEach((day, dayIdx) => {
      const count = day.contributionCount;
      if (count > 0) {
        const enemyY = 40 + dayIdx * 30;
        const size = Math.min(8 + count, 20);
        const isBoss = count >= 10;

        const enemyColor = isBoss ? colors.boss : colors.enemy;
        const healthBar = count;

        enemies += `
          <g class="enemy" transform="translate(${enemyX}, ${enemyY})">
            <!-- Enemy ship -->
            <polygon points="0,-${size} ${size},${size / 2} -${size},${size / 2}"
                     fill="${enemyColor}" opacity="0.8">
              <animate attributeName="opacity" values="0.6;1;0.6" dur="1.5s" repeatCount="indefinite"/>
            </polygon>
            ${isBoss ? `
              <text x="0" y="${size + 12}" text-anchor="middle" fill="${colors.boss}" font-size="8" font-family="monospace">
                BOSS
              </text>
            ` : ""}
            <!-- Health indicator -->
            <rect x="-${size}" y="${size + 4}" width="${Math.min(healthBar * 2, size * 2)}" height="3"
                  fill="${isBoss ? colors.boss : "#00ff00"}" rx="1"/>
          </g>`;

        // Laser from player ship to enemy (animated)
        if (weekIdx < 3) {
          lasers += `
            <line x1="${shipX + 30}" y1="${shipY}"
                  x2="${enemyX}" y2="${enemyY}"
                  stroke="${colors.laser}" stroke-width="2" opacity="0">
              <animate attributeName="opacity" values="0;0.8;0" dur="0.5s"
                       begin="${weekIdx * 0.3 + dayIdx * 0.1}s" repeatCount="indefinite"/>
            </line>`;

          // Explosion effect
          explosions += `
            <circle cx="${enemyX}" cy="${enemyY}" r="0" fill="${colors.explosion}" opacity="0">
              <animate attributeName="r" values="0;15;0" dur="0.8s"
                       begin="${weekIdx * 0.3 + dayIdx * 0.1 + 0.2}s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0;0.7;0" dur="0.8s"
                       begin="${weekIdx * 0.3 + dayIdx * 0.1 + 0.2}s" repeatCount="indefinite"/>
            </circle>`;
        }
      }
    });
    enemyX += 55;
  });

  // Player spaceship
  const ship = `
    <g class="player-ship" transform="translate(${shipX}, ${shipY})">
      <!-- Engine glow -->
      <ellipse cx="-15" cy="0" rx="12" ry="6" fill="${colors.ship}" opacity="0.4">
        <animate attributeName="rx" values="12;20;12" dur="0.3s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.3;0.6;0.3" dur="0.3s" repeatCount="indefinite"/>
      </ellipse>

      <!-- Main body -->
      <polygon points="30,0 -10,-12 -10,12" fill="${colors.ship}" opacity="0.9"/>

      <!-- Cockpit -->
      <ellipse cx="10" cy="0" rx="8" ry="6" fill="#001133" stroke="${colors.ship}" stroke-width="1"/>

      <!-- Wings -->
      <polygon points="-5,-12 -15,-25 -15,-12" fill="${colors.ship}" opacity="0.7"/>
      <polygon points="-5,12 -15,25 -15,12" fill="${colors.ship}" opacity="0.7"/>

      <!-- Weapon tips -->
      <circle cx="30" cy="0" r="3" fill="${colors.laser}">
        <animate attributeName="opacity" values="0.5;1;0.5" dur="0.5s" repeatCount="indefinite"/>
      </circle>
    </g>`;

  // HUD elements
  const hud = `
    <!-- Score display -->
    <rect x="10" y="10" width="180" height="50" fill="rgba(0,0,0,0.5)" rx="5" stroke="${colors.ship}" stroke-width="1"/>
    <text x="20" y="30" fill="${colors.ship}" font-size="10" font-family="monospace">SCORE: ${totalContributions.toLocaleString()}</text>
    <text x="20" y="48" fill="${colors.laser}" font-size="10" font-family="monospace">COMBO: x${currentStreak}</text>

    <!-- Level indicator -->
    <rect x="700" y="10" width="190" height="50" fill="rgba(0,0,0,0.5)" rx="5" stroke="${colors.ship}" stroke-width="1"/>
    <text x="710" y="30" fill="${colors.ship}" font-size="10" font-family="monospace">LEVEL: ${level}</text>
    <text x="710" y="48" fill="${eliteMode ? colors.boss : colors.ship}" font-size="10" font-family="monospace">
      ${eliteMode ? "🏆 ELITE MODE" : "ENEMIES DESTROYED"}
    </text>

    <!-- Title -->
    <text x="450" y="30" text-anchor="middle" fill="${colors.ship}" font-size="14"
          font-family="monospace" font-weight="bold">
      🚀 CONTRIBUTION SPACE BATTLE
      <animate attributeName="fill" values="${colors.ship};${colors.laser};${colors.ship}" dur="3s" repeatCount="indefinite"/>
    </text>

    <!-- Warning for boss -->
    ${currentStreak >= 7 ? `
      <rect x="350" y="250" width="200" height="25" fill="rgba(255,0,0,0.3)" rx="5">
        <animate attributeName="opacity" values="0.3;0.7;0.3" dur="1s" repeatCount="indefinite"/>
      </rect>
      <text x="450" y="267" text-anchor="middle" fill="${colors.boss}" font-size="12" font-family="monospace" font-weight="bold">
        ⚠️ BOSS APPROACHING ⚠️
      </text>
    ` : ""}
  `;

  return `<svg width="900" height="280" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="spaceBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#000011"/>
      <stop offset="50%" stop-color="#001122"/>
      <stop offset="100%" stop-color="#000022"/>
    </linearGradient>
    <filter id="spaceGlow">
      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <rect width="100%" height="100%" fill="url(#spaceBg)"/>

  <!-- Starfield -->
  ${stars}

  <!-- Enemies -->
  <g filter="url(#spaceGlow)">
    ${enemies}
  </g>

  <!-- Lasers -->
  <g filter="url(#spaceGlow)">
    ${lasers}
  </g>

  <!-- Explosions -->
  ${explosions}

  <!-- Player Ship -->
  <g filter="url(#spaceGlow)">
    ${ship}
  </g>

  <!-- HUD -->
  ${hud}

</svg>`;
}

async function main() {
  try {
    const calendar = await fetchContributions();
    const stats = calculateStats(calendar);
    const svg = generateSpaceSVG(stats);
    fs.writeFileSync("output/space-battle.svg", svg);
    console.log("✅ Space Battle SVG generated successfully!");
    return stats;
  } catch (error) {
    console.error("❌ Error generating space battle:", error.message);
    process.exit(1);
  }
}

module.exports = { generateSpaceSVG };

if (require.main === module) {
  main();
}
