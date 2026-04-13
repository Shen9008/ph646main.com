/**
 * Convert Visuals folder images to WebP and output to images/
 * Run: node scripts/convert-visuals-to-webp.js
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const VISUALS_DIR = path.join(__dirname, '..', 'images', 'Visuals');
const OUTPUT_BASE = path.join(__dirname, '..', 'images');

// Map Visuals paths to output paths (relative to images/)
const OUTPUT_MAP = {
  // Hero banners -> images/hero-banner/
  'Hero Banner/Hero banner_About.jpg': 'hero-banner/hero-about.webp',
  'Hero Banner/Hero banner_Blog.jpg': 'hero-banner/hero-blog.webp',
  'Hero Banner/Hero Banner_Help center.jpg': 'hero-banner/hero-help-center.webp',
  'Hero Banner/Hero banner_Live Casino.jpg': 'hero-banner/hero-live-casino.webp',
  'Hero Banner/Hero banner_Promotion.jpg': 'hero-banner/hero-promotion.webp',
  'Hero Banner/Hero banner_Responsible Gaming.jpg': 'hero-banner/hero-responsible-gaming.webp',
  'Hero Banner/Hero banner_Slot.jpg': 'hero-banner/hero-slot.webp',
  'Hero Banner/Hero banner_Sports.jpg': 'hero-banner/hero-sports.webp',
  // Home -> images/home/
  'Home/Home_Free Spins.jpg': 'home/home-free-spins.webp',
  'Home/Home_Jackpot.jpg': 'home/home-jackpot.webp',
  'Home/Home_Live casino.jpg': 'home/home-live-casino.webp',
  'Home/Home_Live Odd bg.jpg': 'home/home-live-odds.webp',
  'Home/Home_Slots.jpg': 'home/home-slots.webp',
  'Home/Home_Sports.jpg': 'home/home-sports.webp',
  // Blog Featured -> images/News/
  'Blog/Featured Articles/Best Online Casinos Australia 2025_.jpg': 'News/best-online-casinos-australia-2025.webp',
  'Blog/Featured Articles/Live Casino Australia Guide.jpg': 'News/live-casino-australia-guide.webp',
  'Blog/Featured Articles/Online online slots Philippines.jpg': 'News/online-pokies-australia.webp',
  // Blog Latest Guides
  'Blog/Latest Guides & Tips/AFL Betting Tips.jpg': 'News/afl-betting-tips-australia.webp',
  'Blog/Latest Guides & Tips/Casino Bonuses Australia Explained.jpg': 'News/casino-bonuses-australia-explained.webp',
  'Blog/Latest Guides & Tips/Deposit Methods Australia Casino.jpg': 'News/deposit-methods-australia-casino.webp',
  'Blog/Latest Guides & Tips/Mobile Casino.jpg': 'News/mobile-casino-australia-guide.webp',
  'Blog/Latest Guides & Tips/NRL Betting Tips.jpg': 'News/nrl-betting-guide-australia.webp',
  'Blog/Latest Guides & Tips/Responsible Gambling Australia.jpg': 'News/responsible-gambling-australia.webp',
  'Blog/Latest Guides & Tips/Safe Online Gambling.jpg': 'News/safe-online-gambling-australia.webp',
  'Blog/Latest Guides & Tips/Slot RTP.jpg': 'News/slot-rtp-explained-australia.webp',
  'Blog/Latest Guides & Tips/sports betting Philippines Guide 2025_.jpg': 'News/sports-betting-australia-guide.webp',
  'Blog/Latest Guides & Tips/Welcome Bonus Casino.jpg': 'News/welcome-bonus-casino-australia.webp',
  'Blog/Latest Guides & Tips/Withdrawal Guide Australia Online Casino.jpg': 'News/withdrawal-guide-australia-online-casino.webp',
  // Blog other
  'Blog/Online Gambling & Casino Guides/Best Online Casinos Australia.jpg': 'News/best-online-casinos-australia-alt.webp',
  'Blog/Online Gambling & Casino Guides/Casino Bonuses Australia.jpg': 'News/casino-bonuses-alt.webp',
  'Blog/Online Gambling & Casino Guides/Deposit Methods Australia Casino Guide.jpg': 'News/deposit-methods-alt.webp',
  'Blog/Online Gambling & Casino Guides/Live Casino Australia Guide 2025.jpg': 'News/live-casino-alt.webp',
  'Blog/Online Gambling & Casino Guides/Mobile Casino Australia Guide 2025.jpg': 'News/mobile-casino-alt.webp',
  'Blog/Online Gambling & Casino Guides/Responsible Gambling Australia.jpg': 'News/responsible-gambling-alt.webp',
  'Blog/Online Gambling & Casino Guides/Safe Online Gambling Australia Guide.jpg': 'News/safe-online-gambling-alt.webp',
  'Blog/Online Gambling & Casino Guides/Welcome Bonus Casino Australia Guide.jpg': 'News/welcome-bonus-alt.webp',
  'Blog/Online Gambling & Casino Guides/Withdrawal Guide Australia Online Casino.jpg': 'News/withdrawal-guide-alt.webp',
  'Blog/Slots & Pokies Guides/Online online slots Philippines.jpg': 'News/online-pokies-alt.webp',
  'Blog/Slots & Pokies Guides/Pokies vs Online Slots.jpg': 'News/pokies-vs-online-slots.webp',
  'Blog/Slots & Pokies Guides/Slot RTP Explained for Filipino Players.jpg': 'News/slot-rtp-alt.webp',
  'Blog/Sports Betting Tips/AFL Betting Tips Australia.jpg': 'News/afl-betting-alt.webp',
  'Blog/Sports Betting Tips/NRL Betting Guide Australia 2025.jpg': 'News/nrl-betting-alt.webp',
  'Blog/Sports Betting Tips/Sport Betting Australia Guide 2025.jpg': 'News/sports-betting-alt.webp',
};

async function convertAll() {
  let converted = 0;
  let skipped = 0;

  for (const [srcRel, destRel] of Object.entries(OUTPUT_MAP)) {
    const srcPath = path.join(VISUALS_DIR, srcRel);
    const destPath = path.join(OUTPUT_BASE, destRel);

    if (!fs.existsSync(srcPath)) {
      console.log('Skip (not found):', srcRel);
      skipped++;
      continue;
    }

    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    try {
      await sharp(srcPath)
        .webp({ quality: 85 })
        .toFile(destPath);
      console.log('OK:', destRel);
      converted++;
    } catch (err) {
      console.error('Error:', srcRel, err.message);
    }
  }

  console.log('\nDone. Converted:', converted, 'Skipped:', skipped);
}

convertAll().catch(console.error);
