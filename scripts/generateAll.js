/**
 * Ultimate Contribution Engine - Main Generator
 * Generates all visual components from GitHub contribution data
 */

const fs = require("fs");
const { fetchContributions, calculateStats } = require("./fetchData");
const { generateBrainSVG } = require("./generateBrain");
const { generateSpaceSVG } = require("./generateSpace");
const { generateMatrixSVG } = require("./generateMatrix");
const { generatePowerJSON, generatePowerSVG } = require("./generatePower");

async function main() {
  console.log("🚀 Ultimate Contribution Engine Starting...\n");

  try {
    // Ensure output directory exists
    if (!fs.existsSync("output")) {
      fs.mkdirSync("output", { recursive: true });
    }

    // Fetch contribution data
    console.log("📊 Fetching contribution data from GitHub...");
    const calendar = await fetchContributions();
    const stats = calculateStats(calendar);
    console.log(`✅ Data fetched: ${stats.totalContributions} total contributions\n`);

    // Generate all visuals
    console.log("🧠 Generating Neural Activity Core...");
    const brainSVG = generateBrainSVG(stats);
    fs.writeFileSync("output/brain-core.svg", brainSVG);
    console.log("✅ Brain Core SVG generated!\n");

    console.log("🚀 Generating Space Battle Layer...");
    const spaceSVG = generateSpaceSVG(stats);
    fs.writeFileSync("output/space-battle.svg", spaceSVG);
    console.log("✅ Space Battle SVG generated!\n");

    console.log("🌌 Generating Matrix System Layer...");
    const matrixSVG = generateMatrixSVG(stats);
    fs.writeFileSync("output/matrix-layer.svg", matrixSVG);
    console.log("✅ Matrix Layer SVG generated!\n");

    console.log("⚡ Generating Power Meter...");
    const powerData = generatePowerJSON(stats);
    fs.writeFileSync("output/power-meter.json", JSON.stringify(powerData, null, 2));
    const powerSVG = generatePowerSVG(stats);
    fs.writeFileSync("output/power-meter.svg", powerSVG);
    console.log("✅ Power Meter generated!\n");

    // Generate stats summary
    const summary = {
      generatedAt: new Date().toISOString(),
      stats: {
        totalContributions: stats.totalContributions,
        currentStreak: stats.currentStreak,
        maxStreak: stats.maxStreak,
        weeklyTotal: stats.weeklyTotal,
        level: stats.level,
        levelTitle: stats.levelTitle,
        xp: stats.xp,
        eliteMode: stats.eliteMode,
      },
      files: [
        "brain-core.svg",
        "space-battle.svg",
        "matrix-layer.svg",
        "power-meter.svg",
        "power-meter.json",
      ],
    };
    fs.writeFileSync("output/engine-stats.json", JSON.stringify(summary, null, 2));

    console.log("═══════════════════════════════════════════════════");
    console.log("🎮 ULTIMATE CONTRIBUTION ENGINE - STATUS REPORT");
    console.log("═══════════════════════════════════════════════════");
    console.log(`📊 Total Contributions: ${stats.totalContributions}`);
    console.log(`🔥 Current Streak: ${stats.currentStreak} days`);
    console.log(`🏆 Max Streak: ${stats.maxStreak} days`);
    console.log(`📈 Weekly Total: ${stats.weeklyTotal} commits`);
    console.log(`⚡ Level: ${stats.level} (${stats.levelTitle})`);
    console.log(`💫 XP: ${stats.xp}`);
    if (stats.eliteMode) {
      console.log(`🚀 ELITE ENGINEER MODE: ACTIVATED`);
    }
    console.log("═══════════════════════════════════════════════════");
    console.log("\n✨ All visuals generated successfully!");

  } catch (error) {
    console.error("❌ Error in Ultimate Contribution Engine:", error.message);
    process.exit(1);
  }
}

main();
