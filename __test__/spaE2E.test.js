import puppeteer from 'puppeteer';

const URL = 'http://localhost:5500/source/index.html';

let browser;
let page;

const beforebefore = async () => {
  browser = await puppeteer.launch({ headless: false });
  page = await browser.newPage();
  page.setDefaultTimeout(0);
};

const afterafter = async () => {
  await page.close();
  await browser.close();
};

/**
 * Tests:
 * - Load 3D homepage
 * - Load 2D homepage
 */
describe('Load Tests', () => {
  beforeEach(beforebefore);

  it('Loads 2D homepage', async () => {
    await page.goto(URL)

    const newNote = await page.$('#newNote');
    await newNote.click();
  }, 10000);

  afterEach(afterafter);
}, 30000);
