/*
 * notesDashboard.js initilizes the functionality and handles the main logic
 * of the note dashboard page (duh).
 *
 * Functions inside this file:
 *   - addNotesToDocument()
 *   - hideEmptyWojak()
 *   - filterNotesByQuery()
 *   - sortNotesByTitle()
 *   - initTimeColumnSorting()
 *   - initTitleColumnSorting()
 *   - initSearchBar()
 */
import { parseNoteDate } from './utility.js';
import { pageData } from './Routing.js'
import { getNotesFromStorage } from './noteStorage.js';

/**
 * @description append the new row to the dashboard in the document
 *
 * @param {Array<Object>} notes containing all the notes in the local storage
 * @returns {void} This function does not return a value.
 */
export function addNotesToDocument(notes) {
  const dashboard = document.querySelector('.dashboardItems');

  // Clear out the existing rows in the dashboard
  const dashboardRow = document.querySelectorAll('dashboard-row');
  dashboardRow.forEach((row) => {
    row.remove();
  });

  // Repopulate dashboard with new notes
  notes.forEach((note) => {
    const row = document.createElement('dashboard-row');
    row.note = note;
    dashboard.appendChild(row);
  });
}

/**
 * @description Show/Hide empty notes on dashboard
 *
 * @param {bool} bool true to hide, false to show
 * @returns {void} this function does not return a value.
 */
export function hideEmptyWojak(bool) {
  const empty = document.querySelector('.empty-dashboard');
  empty.classList.toggle('hidden', bool);
}

/**
 * @description Sort the notes by last modified date
 *
 * @param {Array<Object>} notes - Array containing all the notes in local storage
 * @param {String} sortType - The type of sort, either 'asc' for ascending or 'desc' for descending
 * @returns {Array<Object>} Sorted array of notes
 */
export function sortNotesByTime(notes, sortType) {
  const sortOrder = sortType === 'asc' ? 1 : -1;

  return notes.sort((note1, note2) => {
    const date1 = parseNoteDate(note1.lastModified);
    const date2 = parseNoteDate(note2.lastModified);

    return (date1 - date2) * sortOrder;
  });
}

/**
 * @description Return the notes that match the query string. Case insensitive.
 *
 * @param {Array<Object>} notes Array containing all the notes in local storage
 * @param {String} query The search string to filter the notes on
 * @returns {Array<Object>} Filtered notes array
 */
export function filterNotesByQuery(notes, query) {
  const queryString = query.toLowerCase().replace(/\s+/g, ' ').trim();
  return notes.filter(
    (note) =>
      note.title.toLowerCase().includes(queryString) ||
      note.lastModified.replace('at', '').toLowerCase().includes(queryString)
  );
}

/**
 * @description sort the notes by title
 *
 * @param {Array<Object>} notes containing all the notes in the local storage
 * @param {String} sortType the type of sort, either ascending or descending
 * @returns {Array<Object>} sortedNotes
 */
export function sortNotesByTitle(notes, sortType) {
  return notes.sort((note1, note2) => {
    if (sortType === 'asc') {
      return note1.title.localeCompare(note2.title);
    }
    return note2.title.localeCompare(note1.title);
  });
}

/**
 * Initializes the event handler for sorting notes by time column.
 * @param {Object[]} notes - An array of note objects.
 */
export function initTimeColumnSorting(notes) {
  const timeColSortArrow = document.querySelector('.timeColSortOrder');
  const timeCol = document.querySelector('.timeCol');
  let timeSortCount = 0;

  timeCol.addEventListener('click', async () => {
    const direction = timeSortCount % 2 === 0 ? 'asc' : 'desc';
    timeColSortArrow.setAttribute('direction', '');
    timeColSortArrow.setAttribute('direction', direction);
    timeSortCount += 1;
    addNotesToDocument(sortNotesByTime(notes, direction));
  });
}

/**
 * Initializes the event handler for sorting notes by title column.
 * @param {Object[]} notes - An array of note objects.
 */
export function initTitleColumnSorting(notes) {
  const titleColSortArrow = document.querySelector('.titleColSortOrder');
  const titleCol = document.querySelector('.titleCol');
  let titleSortCount = 0;

  titleCol.addEventListener('click', async () => {
    const direction = titleSortCount % 2 === 0 ? 'asc' : 'desc';
    titleColSortArrow.setAttribute('direction', '');
    titleColSortArrow.setAttribute('direction', direction);
    titleSortCount += 1;
    addNotesToDocument(sortNotesByTitle(notes, direction));
  });
}

/**
 * Searched for notes within the database
 * @param {string} str note name to search for
 * @returns {void} this function does not return a value.
 */
async function search(str) {
  const db = pageData.database;
  const notes = await getNotesFromStorage(db);
  addNotesToDocument(filterNotesByQuery(notes, str));
}

/**
 * Initializes the event handler for filtering notes by search query.
 * @param {Object[]} notes - An array of note objects.
 */
export async function initSearchBar() {
  const searchBar = document.querySelector('.searchBar');

  searchBar.addEventListener('input', (event) => {
    search(event.target.value);
  });
}
