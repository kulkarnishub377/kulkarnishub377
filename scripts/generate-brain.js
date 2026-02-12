const fs = require("fs");
const fetch = require("node-fetch");

const TOKEN = process.env.GITHUB_TOKEN;
const USERNAME = "kulkarnishub377";

const QUERY = `
query {
  user(login: "${USERNAME}") {
    contributionsCollection {
      contributionCalendar {
        weeks {
          contributionDays {
            contributionCount
          }
        }
      }
    }
  }
}
`;

async function fetchContributions() {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: QUERY }),
  });
  const json = await res.json();
  if (json.errors) {
    throw new Error(`GraphQL error: ${json.errors[0].message}`);
  }
  if (!json.data || !json.data.user) {
    throw new Error("Unexpected API response: user data not found");
  }
  return json.data.user.contributionsCollection.contributionCalendar.weeks;
}

function makeSVG(weeks) {
  let neurons = "";
  let connections = "";
  let xPos = 50;

  const points = [];

  weeks.forEach((week) => {
    week.contributionDays.forEach((day, idx) => {
      const count = day.contributionCount;
      const glow = Math.min(count * 3, 18);
      const cy = 100 + idx * 15;
      const opacity = count > 0 ? 0.6 + Math.min(count / 10, 0.4) : 0.15;
      const color = count > 5 ? "#00ffff" : count > 0 ? "#7f00ff" : "#1a1a2e";
      const dur = count > 3 ? "1.5s" : "2s";

      points.push({ x: xPos, y: cy, count });

      neurons += `
        <circle cx="${xPos}" cy="${cy}" r="4"
          fill="${color}" opacity="${opacity}">
          <animate attributeName="r"
                   values="4;${4 + glow};4"
                   dur="${dur}"
                   repeatCount="indefinite" />
        </circle>`;
    });
    xPos += 15;
  });

  // Connect nearby neurons with animated lines
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const dx = points[j].x - points[i].x;
      const dy = points[j].y - points[i].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 25 && points[i].count > 0 && points[j].count > 0) {
        connections += `
        <line x1="${points[i].x}" y1="${points[i].y}"
              x2="${points[j].x}" y2="${points[j].y}"
              stroke="cyan" stroke-width="0.5" opacity="0.3">
          <animate attributeName="stroke-opacity"
                   values="0;0.6;0"
                   dur="3s"
                   repeatCount="indefinite"/>
        </line>`;
      }
    }
  }

  return `<svg width="900" height="300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#1a0033" />
      <stop offset="100%" stop-color="#0d1117" />
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bgGlow)"/>
  <text x="450" y="30" text-anchor="middle" fill="#00ffff" font-size="16"
        font-family="monospace" opacity="0.8">
    🧠 Neural Network Activity
    <animate attributeName="opacity" values="0.5;1;0.5" dur="3s" repeatCount="indefinite"/>
  </text>
  ${connections}
  ${neurons}
</svg>`;
}

(async () => {
  const weeks = await fetchContributions();
  const svg = makeSVG(weeks);
  fs.writeFileSync("output/brain-activity.svg", svg);
  console.log("✅ Brain activity SVG generated successfully!");
})();
