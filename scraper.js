const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
    // 1. Browser Launch Karein (headless: false rakhne se aapko browser dikhega)
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    const keyword = "advanced SEO strategies 2026"; // Yahan apna keyword daalein

    console.log(`Searching Google for: "${keyword}"...`);

    // 2. Google par jayein aur search karein
    await page.goto('https://www.google.com/', { waitUntil: 'domcontentloaded' });
    
    // Search box find karke keyword type karein aur Enter dabayein
    const searchBox = page.locator('textarea[name="q"]');
    await searchBox.fill(keyword);
    await searchBox.press('Enter');

    // 3. Results load hone ka wait karein
    await page.waitForSelector('#search', { timeout: 10000 });
    console.log("Results loaded. Extracting data...");

    // 4. Top Competitor URLs aur Titles nikalna
    const organicResults = await page.evaluate(() => {
        const results = [];
        // Google usually organic links ko h3 > a format mein rakhta hai
        const elements = document.querySelectorAll('#search div.g');
        
        elements.forEach(el => {
            const titleElement = el.querySelector('h3');
            const linkElement = el.querySelector('a');
            
            if (titleElement && linkElement) {
                results.push({
                    title: titleElement.innerText,
                    url: linkElement.href
                });
            }
        });
        return results;
    });

    // 5. "People Also Ask" (PAA) Questions nikalna
    // Note: Google ke CSS classes change hote rehte hain, yeh ek common structure hai
    const paaQuestions = await page.evaluate(() => {
        const questions = [];
        // PAA usually specific divs mein hote hain
        const paaElements = document.querySelectorAll('div[data-q]');
        
        paaElements.forEach(el => {
            const questionText = el.getAttribute('data-q');
            if (questionText) {
                questions.push(questionText);
            }
        });
        return questions;
    });

    // 6. Data ko format karna
    const finalData = {
        keyword: keyword,
        total_organic_results: organicResults.length,
        competitors: organicResults,
        people_also_ask: paaQuestions
    };

    console.log("Data Extracted Successfully!");
    console.log(finalData);

    // 7. Data ko JSON file mein save karna (LLM ya n8n automation ke liye)
    fs.writeFileSync('serp_data.json', JSON.stringify(finalData, null, 2));
    console.log("Data saved to serp_data.json");

    // 8. Browser close karna
    await browser.close();
})();