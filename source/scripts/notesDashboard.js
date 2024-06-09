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
  hideEmptyWojak(notes.length !== 0);
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
      note.content.ops[0].insert.toLowerCase().includes(queryString) ||
      note.lastModified.replace('at', '').toLowerCase().includes(queryString)
  );
  // TODO: add some feature to highlight the search query in the notes
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
  const dropdownContent = document.querySelector('.dropdown-content');
  const timeAscOrder = document.querySelector('#sortTimeAsc-button');
  const timeDescOrder = document.querySelector('#sortTimeDesc-button');

  timeCol.addEventListener('click', async () => {
    const direction = timeSortCount % 2 === 0 ? 'asc' : 'desc';
    timeColSortArrow.setAttribute('direction', '');
    timeColSortArrow.setAttribute('direction', direction);
    timeSortCount += 1;
    addNotesToDocument(sortNotesByTime(notes, direction));
  });

  // Prevent dropdown menu from closing when interacting with its contents
  dropdownContent.addEventListener('click', (event) => {
    event.stopPropagation(); 
  });

  timeAscOrder.addEventListener('click', () => {
    addNotesToDocument(sortNotesByTime(notes, 'asc'));
  });

  timeDescOrder.addEventListener('click', () => {
    addNotesToDocument(sortNotesByTime(notes, 'desc'));
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
  const sortByButton = document.querySelector('.dropdown-button');
  const dropdownContent = document.querySelector('.dropdown-content');
  const titleAscOrder = document.querySelector('#sortTitleAsc-button');
  const titleDescOrder = document.querySelector('#sortTitleDesc-button');

  titleCol.addEventListener('click', async () => {
    const direction = titleSortCount % 2 === 0 ? 'asc' : 'desc';
    titleColSortArrow.setAttribute('direction', '');
    titleColSortArrow.setAttribute('direction', direction);
    titleSortCount += 1;
    addNotesToDocument(sortNotesByTitle(notes, direction));
  });

  // Prevent dropdown menu from closing when interacting with its contents
  dropdownContent.addEventListener('click', (event) => {
    event.stopPropagation(); 
  });

  titleAscOrder.addEventListener('click', () => {
  addNotesToDocument(sortNotesByTitle(notes, 'asc'));
  });

  titleDescOrder.addEventListener('click', () => {
    addNotesToDocument(sortNotesByTitle(notes, 'desc'));
  });
}

/**
 * Initializes the event handler for filtering notes by search query.
 * @param {Object[]} notes - An array of note objects.
 */
export function initSearchBar(notes) {
  const searchBar = document.querySelector('.searchBar');
  searchBar.addEventListener('input', (event) => {
    addNotesToDocument(filterNotesByQuery(notes, event.target.value));
  });
}
