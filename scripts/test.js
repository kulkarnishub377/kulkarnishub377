/**
 * Test script for Ultimate Contribution Engine
 * Runs with mock data to validate all generators
 */

const fs = require("fs");
const { calculateStats } = require("./fetchData");
const { generateBrainSVG } = require("./generateBrain");
const { generateSpaceSVG } = require("./generateSpace");
const { generateMatrixSVG } = require("./generateMatrix");
const { generatePowerJSON, generatePowerSVG } = require("./generatePower");

// Ensure output directory exists
if (!fs.existsSync("output")) {
  fs.mkdirSync("output", { recursive: true });
}

// Mock calendar data
const mockCalendar = {
  totalContributions: 2345,
  weeks: Array.from({ length: 52 }, (_, weekIdx) => ({
    contributionDays: Array.from({ length: 7 }, (_, dayIdx) => ({
      date: new Date(2024, 0, weekIdx * 7 + dayIdx + 1).toISOString().split("T")[0],
      contributionCount: Math.floor(Math.random() * 12),
      weekday: dayIdx,
    })),
  })),
};

// Add a streak at the end
for (let i = 0; i < 35; i++) {
  const weekIdx = 51 - Math.floor(i / 7);
  const dayIdx = 6 - (i % 7);
  if (weekIdx >= 0 && mockCalendar.weeks[weekIdx]) {
    mockCalendar.weeks[weekIdx].contributionDays[dayIdx].contributionCount =
      3 + Math.floor(Math.random() * 8);
  }
}

console.log("🧪 Testing Ultimate Contribution Engine\n");

const stats = calculateStats(mockCalendar);
console.log("📊 Stats generated:", stats.totalContributions, "contributions");
console.log("🔥 Streak:", stats.currentStreak, "days");
console.log("🏆 Elite Mode:", stats.eliteMode);

console.log("\n🧠 Generating Brain SVG...");
const brainSVG = generateBrainSVG(stats);
fs.writeFileSync("output/brain-core.svg", brainSVG);
console.log("✅ Brain Core SVG:", brainSVG.length, "bytes");

console.log("\n🚀 Generating Space Battle SVG...");
const spaceSVG = generateSpaceSVG(stats);
fs.writeFileSync("output/space-battle.svg", spaceSVG);
console.log("✅ Space Battle SVG:", spaceSVG.length, "bytes");

console.log("\n🌌 Generating Matrix Layer SVG...");
const matrixSVG = generateMatrixSVG(stats);
fs.writeFileSync("output/matrix-layer.svg", matrixSVG);
console.log("✅ Matrix Layer SVG:", matrixSVG.length, "bytes");

console.log("\n⚡ Generating Power Meter...");
const powerData = generatePowerJSON(stats);
fs.writeFileSync("output/power-meter.json", JSON.stringify(powerData, null, 2));
const powerSVG = generatePowerSVG(stats);
fs.writeFileSync("output/power-meter.svg", powerSVG);
console.log("✅ Power Meter JSON:", JSON.stringify(powerData).length, "bytes");
console.log("✅ Power Meter SVG:", powerSVG.length, "bytes");

// Validate SVGs
const validateSVG = (name, content) => {
  if (!content.startsWith("<svg")) {
    console.error(`❌ ${name} does not start with <svg>`);
    return false;
  }
  if (!content.includes("</svg>")) {
    console.error(`❌ ${name} does not have closing </svg>`);
    return false;
  }
  console.log(`✅ ${name} is valid SVG`);
  return true;
};

console.log("\n🔍 Validating SVGs...");
let allValid = true;
allValid = validateSVG("Brain Core", brainSVG) && allValid;
allValid = validateSVG("Space Battle", spaceSVG) && allValid;
allValid = validateSVG("Matrix Layer", matrixSVG) && allValid;
allValid = validateSVG("Power Meter", powerSVG) && allValid;

if (allValid) {
  console.log("\n🎉 All tests passed successfully!");
} else {
  console.log("\n❌ Some tests failed!");
  process.exit(1);
}
