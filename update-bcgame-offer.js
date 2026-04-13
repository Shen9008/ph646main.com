const fs = require('fs');
const path = require('path');

const newsDir = path.join(__dirname, 'news');
const files = fs.readdirSync(newsDir).filter(f => f.endsWith('.html'));

console.log(`Updating BC.GAME offers in ${files.length} files...\n`);

let updatedCount = 0;

files.forEach(file => {
    const filePath = path.join(newsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Update RM16,000 to $20,000
    if (content.includes('RM16,000')) {
        content = content.replace(/RM16,000/g, '$20,000');
        modified = true;
    }
    
    // Also check for RM 16,000 (with space)
    if (content.includes('RM 16,000')) {
        content = content.replace(/RM 16,000/g, '$20,000');
        modified = true;
    }
    
    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✓ Updated: ${file}`);
        updatedCount++;
    }
});

console.log(`\n✅ Updated ${updatedCount} files`);
console.log(`   Changed: RM16,000 → $20,000`);
