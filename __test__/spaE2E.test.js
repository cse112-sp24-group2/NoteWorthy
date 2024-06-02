/*
 * @jest-environment node
 */
import puppeteer from 'puppeteer';

const URL = 'http://localhost:5500/source/';

let browser;
let page;

const beforebefore = async () => {
  // Change headless to false when testing locally if you want the browser to
  // pop up, before commiting, change back to "new" otherwise github actions will
  // fail
  browser = await puppeteer.launch({ headless: false });
  page = await browser.newPage();
  page.setDefaultTimeout(0);
  await page.goto(URL)
  await new Promise((resolve) => setTimeout(resolve, 1000));
};

const afterafter = async () => {
  await page.close();
  await browser.close();
};

/**
 * Fetches and returns classlist of element in dom of page
 * @param { String } tag tag of HTMLElement to fetch
 * @returns {Promise Array<Class> }
 */
async function getClassList(tag) {
  const arr = await page.waitForSelector(tag);
  const result = await page.evaluate((el) => el.classList, arr);
  return Object.values(result);
} /* getClassList */

/**
 * presses the new note button
 */
async function createNewNote() {
  const newNote = '#newNote';
  await page.waitForSelector(newNote).then((el) => el.click());
}

describe('Dashboard tests', () => {
  beforeEach(beforebefore);

  test('New Note button toggles editor/dashboard view', async () => {
    let dashboard = await getClassList('.dashboard');
    let editor = await getClassList('.editor');

    expect(editor).toContain('hidden')
    expect(dashboard).not.toContain('hidden')

    await createNewNote();

    dashboard = await getClassList('.dashboard');
    editor = await getClassList('.editor');

    expect(editor).not.toContain('hidden')
    expect(dashboard).toContain('hidden')
    expect(page.url()).toBe(URL + '?id=9999');
  }, 5000);

  test('New Note is added to dashboard', async () => {
    await createNewNote();

    expect(page.url()).toBe(URL + '?id=9999');

    let titleText = await page.$eval('#notes-title', (el) => el.innerHTML);
    expect(titleText).toBe(
      '<input type="text" id="title-input" placeholder="Untitled Note">'
    );
    const inputTxt = await page.$('#title-input');
    await inputTxt.click({ clickCount: 1 });
    await page.type('#title-input', 'title text');
    titleText = await page.$eval('#title-input', (e) => e.value);
    expect(titleText).toBe('title text');

    const editor = await page.$('.ql-editor');
    await editor.click({ clickCount: 1 });
    await page.type('.ql-editor', 'editor text');

    await page.waitForSelector('#save-button').then((el) => el.click());
    await page.waitForSelector('#back-button').then((el) => el.click());
    
    const numNotes = await page.$$eval('dashboard-row', (noteItems) => noteItems.length);
    expect(numNotes).toBe(1);
  }, 5000);

  test('New Note on dashboard contains correct title and content', async () => {
    await createNewNote();

    expect(page.url()).toBe(URL + '?id=9999');

    const inputTxt = await page.$('#title-input');
    await inputTxt.click({ clickCount: 1 });
    await page.type('#title-input', 'title text');

    const editor = await page.$('.ql-editor');
    await editor.click({ clickCount: 1 });
    await page.type('.ql-editor', 'editor text');

    await page.waitForSelector('#save-button').then((el) => el.click());
    await page.waitForSelector('#back-button').then((el) => el.click());


    const title = await page.$eval('>>> .note-title', (el) => el.innerHTML);
    expect(title).toBe('title text');

    const content = await page.$eval('>>> .note-text > p', (el) => el.innerHTML);
    expect(content).toBe('editor text');
    expect(page.url()).toBe(URL);
  }, 5000);

  test('Dashboard note fliping', async () => {
    await createNewNote();

    const inputTxt = await page.$('#title-input');
    await inputTxt.click({ clickCount: 1 });
    await page.type('#title-input', 'title text');

    const editor = await page.$('.ql-editor');
    await editor.click({ clickCount: 1 });
    await page.type('.ql-editor', 'editor text');

    await page.waitForSelector('#save-button').then((el) => el.click());
    await page.waitForSelector('#back-button').then((el) => el.click());

    let front = await getClassList('>>> .note-front');
    expect(front).not.toContain('flipped')

    await page.waitForSelector('>>> .note-more').then((el) => el.click());

    front = await getClassList('>>> .note-front');
    expect(front).toContain('flipped')
  }, 5000);

  test('Duplicating notes', async () => {
    await createNewNote();

    const inputTxt = await page.$('#title-input');
    await inputTxt.click({ clickCount: 1 });
    await page.type('#title-input', 'title text');

    const editor = await page.$('.ql-editor');
    await editor.click({ clickCount: 1 });
    await page.type('.ql-editor', 'editor text');

    await page.waitForSelector('#save-button').then((el) => el.click());
    await page.waitForSelector('#back-button').then((el) => el.click());

    let front = await getClassList('>>> .note-front');
    expect(front).not.toContain('flipped')

    await page.waitForSelector('>>> .note-more').then((el) => el.click());

    front = await getClassList('>>> .note-front');
    expect(front).toContain('flipped')
  }, 5000);

  afterEach(afterafter);
}, 30000);
