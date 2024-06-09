/*
 * @jest-environment node
 */
import puppeteer from 'puppeteer';

const URL = 'http://localhost:5173/';

let browser;
let page;

function delay(time) {
  return new Promise(function executor(resolve) {
    setTimeout(resolve, time);
  });
}

const beforebefore = async () => {
  // Change headless to false when testing locally if you want the browser to
  // pop up, before commiting, change back to "new" otherwise github actions will
  // fail
  browser = await puppeteer.launch({ headless: 'new' });
  page = await browser.newPage();
  page.setDefaultTimeout(0);
  await page.goto(URL);
  await delay(1000);
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

    expect(editor).toContain('hidden');
    expect(dashboard).not.toContain('hidden');

    await createNewNote();

    dashboard = await getClassList('.dashboard');
    editor = await getClassList('.editor');

    expect(editor).not.toContain('hidden');
    expect(dashboard).toContain('hidden');
    expect(page.url()).toBe(`${URL}?id=9999`);
  }, 5000);

  test('New Note is added to dashboard', async () => {
    await createNewNote();

    expect(page.url()).toBe(`${URL}?id=9999`);

    let titleText = await page.$eval('#notes-title', (el) => el.innerHTML);
    expect(titleText).toBe(`<input type="text" class="" id="title-input" placeholder="Untitled Note">`);
    const inputTxt = await page.$('#title-input');
    await inputTxt.click({ clickCount: 1 });
    await page.type('#title-input', 'title text');
    titleText = await page.$eval('#title-input', (e) => e.value);
    expect(titleText).toBe('title text');

    const editor = await page.$('.ql-editor');
    await editor.click({ clickCount: 1 });
    await page.type('.ql-editor', 'editor text');

    await page.waitForSelector('#back-button').then((el) => el.click());
    await delay(200);

    const numNotes = await page.$$eval('dashboard-row', (noteItems) => noteItems.length);
    expect(numNotes).toBe(1);
  }, 5000);

  test('New Note on dashboard contains correct title and content', async () => {
    await createNewNote();

    expect(page.url()).toBe(`${URL}?id=9999`);

    const inputTxt = await page.$('#title-input');
    await inputTxt.click({ clickCount: 1 });
    await page.type('#title-input', 'title text');

    const editor = await page.$('.ql-editor');
    await editor.click({ clickCount: 1 });
    await page.type('.ql-editor', 'editor text');

    await page.waitForSelector('#back-button').then((el) => el.click());
    await delay(200);

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

    await page.waitForSelector('#back-button').then((el) => el.click());
    await delay(200);

    let front = await getClassList('>>> .note-front');
    expect(front).not.toContain('flipped');

    await page.waitForSelector('>>> .note-more').then((el) => el.click());

    front = await getClassList('>>> .note-front');
    expect(front).toContain('flipped');
  }, 5000);

  test('Duplicating notes', async () => {
    await createNewNote();

    const inputTxt = await page.$('#title-input');
    await inputTxt.click({ clickCount: 1 });
    await page.type('#title-input', 'title text');

    const editor = await page.$('.ql-editor');
    await editor.click({ clickCount: 1 });
    await page.type('.ql-editor', 'editor text');

    await page.waitForSelector('#back-button').then((el) => el.click());
    await delay(200);

    await page.waitForSelector('>>> .note-more').then((el) => el.click());
    await page.waitForSelector('>>> .note-copy-button').then((el) => el.click());

    await delay(200);
    const numNotes = await page.$$eval('dashboard-row', (noteItems) => noteItems.length);
    expect(numNotes).toBe(2);
  }, 5000);

  test('Custom Dialog opens when deleting note', async () => {
    await createNewNote();

    const inputTxt = await page.$('#title-input');
    await inputTxt.click({ clickCount: 1 });
    await page.type('#title-input', 'title text');

    const editor = await page.$('.ql-editor');
    await editor.click({ clickCount: 1 });
    await page.type('.ql-editor', 'editor text');

    await page.waitForSelector('#back-button').then((el) => el.click());
    await delay(200);

    await page.waitForSelector('>>> .note-more').then((el) => el.click());
    await page.waitForSelector('>>> .note-delete-button').then((el) => el.click());

    const dialogElement = await page.$('dialog');
    const isDialogOpen = await dialogElement.isVisible();

    expect(isDialogOpen).toBe(true);
  });

  test('Pressing Yes on custom dialog deletes note', async () => {
    await createNewNote();

    const inputTxt = await page.$('#title-input');
    await inputTxt.click({ clickCount: 1 });
    await page.type('#title-input', 'title text');

    const editor = await page.$('.ql-editor');
    await editor.click({ clickCount: 1 });
    await page.type('.ql-editor', 'editor text');

    await page.waitForSelector('#back-button').then((el) => el.click());
    await delay(200);

    await page.waitForSelector('>>> .note-more').then((el) => el.click());
    await page.waitForSelector('>>> .note-delete-button').then((el) => el.click());

    const dialogElement = await page.$('dialog');
    const isDialogOpen = await dialogElement.isVisible();
    expect(isDialogOpen).toBe(true);

    await page.waitForSelector('>>> .dialog-confirm').then((el) => el.click());

    await delay(400);
    const numNotes = await page.$$eval('dashboard-row', (noteItems) => noteItems.length);
    expect(numNotes).toBe(0);
  });

  test('Pressing No on custom dialog deletes note', async () => {
    await createNewNote();

    const inputTxt = await page.$('#title-input');
    await inputTxt.click({ clickCount: 1 });
    await page.type('#title-input', 'title text');

    const editor = await page.$('.ql-editor');
    await editor.click({ clickCount: 1 });
    await page.type('.ql-editor', 'editor text');

    await page.waitForSelector('#back-button').then((el) => el.click());
    await delay(200);

    await page.waitForSelector('>>> .note-more').then((el) => el.click());
    await page.waitForSelector('>>> .note-delete-button').then((el) => el.click());

    const dialogElement = await page.$('dialog');
    const isDialogOpen = await dialogElement.isVisible();

    expect(isDialogOpen).toBe(true);

    await page.waitForSelector('>>> .dialog-cancel').then((el) => el.click());
    await delay(400);
    const numNotes = await page.$$eval('dashboard-row', (noteItems) => noteItems.length);
    expect(numNotes).toBe(1);
  });

  afterEach(afterafter);
}, 30000);

describe('Editor tests', () => {
  beforeEach(beforebefore);

  test('Clicking on top left logo redirects to dashboard', async () => {
    await createNewNote();

    const inputTxt = await page.$('#title-input');
    await inputTxt.click({ clickCount: 1 });
    await page.type('#title-input', 'title text');

    const editor = await page.$('.ql-editor');
    await editor.click({ clickCount: 1 });
    await page.type('.ql-editor', 'editor text');

    await page.waitForSelector('.header > h1').then((el) => el.click());
    await delay(200);
    expect(page.url()).toBe(`${URL}`);
  });

  test('Custom Dialog opens when deleting note', async () => {
    await createNewNote();

    const inputTxt = await page.$('#title-input');
    await inputTxt.click({ clickCount: 1 });
    await page.type('#title-input', 'title text');

    const editor = await page.$('.ql-editor');
    await editor.click({ clickCount: 1 });
    await page.type('.ql-editor', 'editor text');

    await page.waitForSelector('#back-button').then((el) => el.click());
    await delay(200);
    await page.waitForSelector('>>> .note-front').then((el) => el.click());
    await delay(200);
    await page.waitForSelector('#delete-button').then((el) => el.click());
    await delay(200);

    const dialogElement = await page.$('dialog');
    const isDialogOpen = await dialogElement.isVisible();

    expect(isDialogOpen).toBe(true);
  });

  test('Pressing Yes on custom dialog deletes note', async () => {
    await createNewNote();

    const inputTxt = await page.$('#title-input');
    await inputTxt.click({ clickCount: 1 });
    await page.type('#title-input', 'title text');

    const editor = await page.$('.ql-editor');
    await editor.click({ clickCount: 1 });
    await page.type('.ql-editor', 'editor text');

    await page.waitForSelector('#back-button').then((el) => el.click());
    await delay(200);
    await page.waitForSelector('>>> .note-front').then((el) => el.click());
    await delay(200);
    await page.waitForSelector('#delete-button').then((el) => el.click());
    await delay(200);

    const dialogElement = await page.$('dialog');
    const isDialogOpen = await dialogElement.isVisible();

    expect(isDialogOpen).toBe(true);

    await page.waitForSelector('.dialog-confirm').then((el) => el.click());
    await delay(200);
    const numNotes = await page.$$eval('dashboard-row', (noteItems) => noteItems.length);
    expect(numNotes).toBe(0);
  });

  test('Pressing No on custom dialog does not delete note', async () => {
    await createNewNote();

    const inputTxt = await page.$('#title-input');
    await inputTxt.click({ clickCount: 1 });
    await page.type('#title-input', 'title text');

    const editor = await page.$('.ql-editor');
    await editor.click({ clickCount: 1 });
    await page.type('.ql-editor', 'editor text');

    await page.waitForSelector('#back-button').then((el) => el.click());
    await delay(200);
    await page.waitForSelector('>>> .note-front').then((el) => el.click());
    await delay(200);
    await page.waitForSelector('#delete-button').then((el) => el.click());
    await delay(200);

    const dialogElement = await page.$('dialog');
    const isDialogOpen = await dialogElement.isVisible();

    expect(isDialogOpen).toBe(true);

    await page.waitForSelector('.dialog-cancel').then((el) => el.click());
    await page.waitForSelector('#back-button').then((el) => el.click());
    await delay(200);

    const numNotes = await page.$$eval('dashboard-row', (noteItems) => noteItems.length);
    expect(numNotes).toBe(1);
  });

  test('Saving note without title triggers alert', async () => {
    await createNewNote();

    const inputTxt = await page.$('#title-input');
    await inputTxt.click({ clickCount: 1 });
    await page.type('#title-input', '');

    const editor = await page.$('.ql-editor');
    await editor.click({ clickCount: 1 });
    await page.type('.ql-editor', 'editor text');

    await page.waitForSelector('#back-button').then((el) => el.click());
    await delay(200);

    const dialogElement = await page.$('dialog');
    let isDialogOpen = await dialogElement.isVisible();

    expect(isDialogOpen).toBe(true);

    await page.waitForSelector('.dialog-cancel').then((el) => el.click());
    isDialogOpen = await dialogElement.isVisible();
    expect(isDialogOpen).toBe(false);
  });

  afterEach(afterafter);
}, 30000);

describe('User flow tests', () => {
  beforeEach(beforebefore);
  test('Modifying saved note content persists', async () => {
    await createNewNote();

    let inputTxt = await page.$('#title-input');
    await inputTxt.click({ clickCount: 1 });
    await page.type('#title-input', 'title text');

    let editor = await page.$('.ql-editor');
    await editor.click({ clickCount: 1 });
    await page.type('.ql-editor', 'editor text');

    await page.waitForSelector('#back-button').then((el) => el.click());
    await delay(200);

    let title = await page.$eval('>>> .note-title', (el) => el.innerHTML);
    expect(title).toBe('title text');

    let content = await page.$eval('>>> .note-text > p', (el) => el.innerHTML);
    expect(content).toBe('editor text');
    expect(page.url()).toBe(URL);

    await page.waitForSelector('>>> .note-front').then((el) => el.click());

    inputTxt = await page.$('#title-input');
    await inputTxt.click({ clickCount: 3 });
    await page.type('#title-input', 'edited title');

    editor = await page.$('.ql-editor');
    await editor.click({ clickCount: 3 });
    await page.type('.ql-editor', 'edited text');

    await page.waitForSelector('#back-button').then((el) => el.click());
    await delay(200);

    title = await page.$eval('>>> .note-title', (el) => el.innerHTML);
    expect(title).toBe('edited title');

    content = await page.$eval('>>> .note-text > p', (el) => el.innerHTML);
    expect(content).toBe('edited text');
    expect(page.url()).toBe(URL);
    const numNotes = await page.$$eval('dashboard-row', (noteItems) => noteItems.length);
    expect(numNotes).toBe(1);
  });

  test('Multiple Notes added persist on dashboard (20)', async () => {
    const NUM = 20;

    for (let i = 0; i < NUM; i += 1) {
      // eslint-disable-next-line
      await createNewNote();

      // eslint-disable-next-line
      const inputTxt = await page.$('#title-input');
      // eslint-disable-next-line
      await inputTxt.click({ clickCount: 1 });
      // eslint-disable-next-line
      await page.type('#title-input', 'title text');

      // eslint-disable-next-line
      const editor = await page.$('.ql-editor');
      // eslint-disable-next-line
      await editor.click({ clickCount: 1 });
      // eslint-disable-next-line
      await page.type('.ql-editor', 'editor text');

      // eslint-disable-next-line
      await page.waitForSelector('#back-button').then((el) => el.click());
      // eslint-disable-next-line
      await delay(200);
    }
    const numNotes = await page.$$eval('dashboard-row', (noteItems) => noteItems.length);
    expect(numNotes).toBe(NUM);
  }, 100000);

  afterEach(afterafter);
}, 30000);
