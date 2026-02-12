const fetch = require("node-fetch");

const TOKEN = process.env.GITHUB_TOKEN;
const USERNAME = process.env.GITHUB_USERNAME || "kulkarnishub377";

const QUERY = `
query {
  user(login: "${USERNAME}") {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
            weekday
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
  return json.data.user.contributionsCollection.contributionCalendar;
}

function calculateStats(calendar) {
  const { totalContributions, weeks } = calendar;
  const allDays = weeks.flatMap((w) => w.contributionDays);

  // Calculate current streak
  let currentStreak = 0;
  for (let i = allDays.length - 1; i >= 0; i--) {
    if (allDays[i].contributionCount > 0) {
      currentStreak++;
    } else {
      break;
    }
  }

  // Calculate max streak
  let maxStreak = 0;
  let tempStreak = 0;
  for (const day of allDays) {
    if (day.contributionCount > 0) {
      tempStreak++;
      maxStreak = Math.max(maxStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  // Get last 7 days for weekly heatmap
  const last7Days = allDays.slice(-7);
  const weeklyTotal = last7Days.reduce((sum, d) => sum + d.contributionCount, 0);

  // Calculate level based on total contributions
  let level = 1;
  let levelTitle = "Rookie";
  if (totalContributions >= 5000) {
    level = 10;
    levelTitle = "Architect Supreme";
  } else if (totalContributions >= 3000) {
    level = 8;
    levelTitle = "Master Engineer";
  } else if (totalContributions >= 2000) {
    level = 7;
    levelTitle = "Senior Developer";
  } else if (totalContributions >= 1000) {
    level = 5;
    levelTitle = "Full Stack Hero";
  } else if (totalContributions >= 500) {
    level = 4;
    levelTitle = "Rising Star";
  } else if (totalContributions >= 250) {
    level = 3;
    levelTitle = "Code Explorer";
  } else if (totalContributions >= 100) {
    level = 2;
    levelTitle = "Commit Warrior";
  }

  // Calculate XP
  const xp = totalContributions * 10;
  const xpToNextLevel = Math.ceil((level + 1) * 500);
  const currentLevelXP = level * 500;
  const xpProgress = ((xp - currentLevelXP) / (xpToNextLevel - currentLevelXP)) * 100;

  // Elite mode check
  const eliteMode = currentStreak >= 30;

  return {
    totalContributions,
    currentStreak,
    maxStreak,
    weeklyTotal,
    last7Days,
    weeks,
    level,
    levelTitle,
    xp,
    xpProgress: Math.min(100, Math.max(0, xpProgress)),
    eliteMode,
  };
}

module.exports = { fetchContributions, calculateStats, USERNAME };

// Run standalone
if (require.main === module) {
  (async () => {
    try {
      const calendar = await fetchContributions();
      const stats = calculateStats(calendar);
      console.log("📊 Contribution Stats:");
      console.log(JSON.stringify(stats, null, 2));
    } catch (error) {
      console.error("Error fetching data:", error.message);
      process.exit(1);
    }
  })();
}
