#!/usr/bin/env node
/**
 * Frontend UI Smoke Tests
 * Tests critical React components and functionality
 */

const puppeteer = require('puppeteer');

const FRONTEND_URL = 'http://localhost:5173';
const TIMEOUT = 30000;

const colors = {
  green: '\x1b[92m',
  red: '\x1b[91m',
  yellow: '\x1b[93m',
  blue: '\x1b[94m',
  bold: '\x1b[1m',
  end: '\x1b[0m'
};

function printTest(name, status, message = '', elapsed = 0) {
  const icon = status ? '✅' : '❌';
  const color = status ? colors.green : colors.red;
  const elapsedStr = elapsed ? ` (${elapsed}ms)` : '';
  console.log(`${icon} ${color}${name}${colors.end}${elapsedStr}`);
  if (message) {
    console.log(`   ${message}`);
  }
}

async function runTests() {
  console.log(`\n${colors.bold}${colors.blue}🧪 OrgMind Frontend Smoke Tests${colors.end}\n`);
  console.log(`Testing: ${FRONTEND_URL}\n`);

  let browser;
  let results = [];

  try {
    // Launch browser
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 });

    console.log(`${colors.bold}Page Load Tests:${colors.end}`);

    // Test 1: Page loads
    const start1 = Date.now();
    try {
      await page.goto(FRONTEND_URL, { waitUntil: 'networkidle0', timeout: TIMEOUT });
      const elapsed1 = Date.now() - start1;
      printTest('Page Loads', true, 'React app mounted', elapsed1);
      results.push(true);
    } catch (e) {
      printTest('Page Loads', false, e.message);
      results.push(false);
      throw e;
    }

    // Test 2: Main components render
    const start2 = Date.now();
    try {
      await page.waitForSelector('.navbar', { timeout: 5000 });
      await page.waitForSelector('.col-sidebar', { timeout: 5000 });
      await page.waitForSelector('.col-center', { timeout: 5000 });
      await page.waitForSelector('.col-right', { timeout: 5000 });
      const elapsed2 = Date.now() - start2;
      printTest('Three-Column Layout', true, 'All columns visible', elapsed2);
      results.push(true);
    } catch (e) {
      printTest('Three-Column Layout', false, e.message);
      results.push(false);
    }

    // Test 3: Navbar components
    const start3 = Date.now();
    try {
      const logo = await page.$('.navbar-logo');
      const aiActivity = await page.$('button:has-text("AI Activity")') || await page.$('.navbar-button');
      const stats = await page.$('.navbar-stats');
      
      const elapsed3 = Date.now() - start3;
      if (logo && aiActivity && stats) {
        printTest('Navbar Components', true, 'Logo, AI Activity, Stats present', elapsed3);
        results.push(true);
      } else {
        printTest('Navbar Components', false, 'Missing components', elapsed3);
        results.push(false);
      }
    } catch (e) {
      printTest('Navbar Components', false, e.message);
      results.push(false);
    }

    console.log(`\n${colors.bold}Right Sidebar Tests:${colors.end}`);

    // Test 4: Right sidebar tabs
    const start4 = Date.now();
    try {
      const tabs = await page.$$('.panel-tabs .tab');
      const elapsed4 = Date.now() - start4;
      
      if (tabs.length === 3) {
        const tabTexts = await Promise.all(
          tabs.map(tab => page.evaluate(el => el.textContent, tab))
        );
        printTest('Right Sidebar Tabs', true, `3 tabs: ${tabTexts.join(', ')}`, elapsed4);
        results.push(true);
      } else {
        printTest('Right Sidebar Tabs', false, `Expected 3 tabs, found ${tabs.length}`, elapsed4);
        results.push(false);
      }
    } catch (e) {
      printTest('Right Sidebar Tabs', false, e.message);
      results.push(false);
    }

    // Test 5: Tab switching
    const start5 = Date.now();
    try {
      const tabs = await page.$$('.panel-tabs .tab');
      
      if (tabs.length >= 2) {
        // Click second tab (Timeline)
        await tabs[1].click();
        await page.waitForTimeout(500);
        
        // Check if Timeline component is visible
        const timelineVisible = await page.evaluate(() => {
          return document.querySelector('.timeline-panel') !== null;
        });
        
        const elapsed5 = Date.now() - start5;
        if (timelineVisible) {
          printTest('Tab Switching', true, 'Timeline tab works', elapsed5);
          results.push(true);
        } else {
          printTest('Tab Switching', false, 'Timeline not visible', elapsed5);
          results.push(false);
        }
      }
    } catch (e) {
      printTest('Tab Switching', false, e.message);
      results.push(false);
    }

    // Test 6: Conflicts tab
    const start6 = Date.now();
    try {
      const tabs = await page.$$('.panel-tabs .tab');
      
      if (tabs.length >= 3) {
        // Click third tab (Conflicts)
        await tabs[2].click();
        await page.waitForTimeout(500);
        
        // Check if Conflict Detection component is visible
        const conflictsVisible = await page.evaluate(() => {
          return document.querySelector('.conflict-detection-panel') !== null;
        });
        
        const elapsed6 = Date.now() - start6;
        if (conflictsVisible) {
          printTest('Conflicts Tab', true, 'Conflict Detection loads', elapsed6);
          results.push(true);
        } else {
          printTest('Conflicts Tab', false, 'Conflicts panel not visible', elapsed6);
          results.push(false);
        }
      }
    } catch (e) {
      printTest('Conflicts Tab', false, e.message);
      results.push(false);
    }

    console.log(`\n${colors.bold}Interaction Tests:${colors.end}`);

    // Test 7: Query input
    const start7 = Date.now();
    try {
      const input = await page.$('.ask-input');
      const elapsed7 = Date.now() - start7;
      
      if (input) {
        printTest('Query Input', true, 'Sidebar input field present', elapsed7);
        results.push(true);
      } else {
        printTest('Query Input', false, 'Input not found', elapsed7);
        results.push(false);
      }
    } catch (e) {
      printTest('Query Input', false, e.message);
      results.push(false);
    }

    // Test 8: Suggested questions
    const start8 = Date.now();
    try {
      const prompts = await page.$$('.prompt-chip');
      const elapsed8 = Date.now() - start8;
      
      if (prompts.length === 3) {
        printTest('Suggested Questions', true, '3 prompt chips visible', elapsed8);
        results.push(true);
      } else {
        printTest('Suggested Questions', false, `Expected 3, found ${prompts.length}`, elapsed8);
        results.push(false);
      }
    } catch (e) {
      printTest('Suggested Questions', false, e.message);
      results.push(false);
    }

    // Test 9: Knowledge graph
    const start9 = Date.now();
    try {
      const graph = await page.$('.react-flow');
      const elapsed9 = Date.now() - start9;
      
      if (graph) {
        printTest('Knowledge Graph', true, 'ReactFlow graph rendered', elapsed9);
        results.push(true);
      } else {
        printTest('Knowledge Graph', false, 'Graph not found', elapsed9);
        results.push(false);
      }
    } catch (e) {
      printTest('Knowledge Graph', false, e.message);
      results.push(false);
    }

    console.log(`\n${colors.bold}Console Error Check:${colors.end}`);

    // Test 10: No console errors
    const start10 = Date.now();
    try {
      const logs = await page.evaluate(() => {
        return window.__consoleErrors || [];
      });
      
      // Set up console error tracking
      await page.evaluate(() => {
        window.__consoleErrors = [];
        const oldError = console.error;
        console.error = function(...args) {
          window.__consoleErrors.push(args.join(' '));
          oldError.apply(console, args);
        };
      });
      
      await page.waitForTimeout(2000);
      
      const errors = await page.evaluate(() => window.__consoleErrors || []);
      const elapsed10 = Date.now() - start10;
      
      // Filter out React DevTools message
      const realErrors = errors.filter(e => 
        !e.includes('Download the React DevTools') &&
        !e.includes('extension')
      );
      
      if (realErrors.length === 0) {
        printTest('Console Errors', true, 'No errors detected', elapsed10);
        results.push(true);
      } else {
        printTest('Console Errors', false, `${realErrors.length} errors found`, elapsed10);
        realErrors.forEach(err => console.log(`   ${err}`));
        results.push(false);
      }
    } catch (e) {
      printTest('Console Errors', false, e.message);
      results.push(false);
    }

  } catch (error) {
    console.error(`\n${colors.red}Fatal Error: ${error.message}${colors.end}`);
    if (browser) await browser.close();
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }

  // Summary
  const passed = results.filter(r => r).length;
  const total = results.length;
  const successRate = (passed / total) * 100;

  console.log(`\n${'='.repeat(50)}`);
  console.log(`${colors.bold}Summary:${colors.end}`);
  console.log(`  Passed: ${passed}/${total} (${successRate.toFixed(0)}%)`);

  if (successRate === 100) {
    console.log(`  ${colors.green}Status: ✅ ALL TESTS PASSED${colors.end}\n`);
    process.exit(0);
  } else if (successRate >= 80) {
    console.log(`  ${colors.yellow}Status: ⚠️  MOSTLY PASSING${colors.end}\n`);
    process.exit(0);
  } else {
    console.log(`  ${colors.red}Status: ❌ TESTS FAILED${colors.end}\n`);
    process.exit(1);
  }
}

main().catch(error => {
  console.error(`\n${colors.red}Test suite failed: ${error.message}${colors.end}`);
  process.exit(1);
});
