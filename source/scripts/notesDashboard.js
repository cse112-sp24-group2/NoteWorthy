/*
 * notesDashboard.js initilizes the functionality and handles the main logic
 * of the note dashboard page (duh).
 *
 * Functions inside this file:
 *   - addNotesToDocument()
 *   - hideEmptyWojak()
 *   - filterNotesByQuery()
 *   - sortNotesByTime()
 *   - sortNotesByTitle()
 *   - filterNotesByQuery()
 *   - initSortBy()
 *   - initSearchBar()
 */
import { parseNoteDate } from './utility.js';
import { pageData } from './Routing.js';
import { getNotesFromStorage } from './noteStorage.js';

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
export async function sortNotesByTime(sortType) {
  const notes = await getNotesFromStorage(pageData.database);
  console.log(notes);
  const sortOrder = sortType === 'asc' ? 1 : -1;

  return notes.sort((note1, note2) => {
    const date1 = parseNoteDate(note1.lastModified);
    const date2 = parseNoteDate(note2.lastModified);

    return (date1 - date2) * sortOrder;
  });
}

/**
 * @description sort the notes by title
 *
 * @param {Array<Object>} notes containing all the notes in the local storage
 * @param {String} sortType the type of sort, either ascending or descending
 * @returns {Array<Object>} sortedNotes
 */
export async function sortNotesByTitle(sortType) {
  const notes = await getNotesFromStorage(pageData.database);
  return notes.sort((note1, note2) => {
    if (sortType === 'asc') {
      return note1.title.localeCompare(note2.title);
    }
    return note2.title.localeCompare(note1.title);
  });
}

/**
 * @description Return the notes that match the query string. Case insensitive.
 *
 * @param {Array<Object>} notes Array containing all the notes in local storage
 * @param {String} query The search string to filter the notes on
 * @returns {Array<Object>} Filtered notes array
 */
export async function filterNotesByQuery(query) {
  const notes = await getNotesFromStorage(pageData.database);
  const queryString = query.toLowerCase().replace(/\s+/g, ' ').trim();
  return notes.filter(
    (note) =>
      note.title.toLowerCase().includes(queryString) ||
      note.content.ops[0].insert.toLowerCase().includes(queryString) ||
      note.lastModified.replace('at', '').toLowerCase().includes(queryString)
  );
}

/**
 * @description This function sets up event listeners on dropdown buttons for sorting notes
 * by title and time in ascending and descending order. It toggles the visibility
 * of the dropdown content and prevents event propagation to ensure proper behavior.
 *
 * @returns {void} this function does not return a value.
 */
export function initSortBy() {
  const sortByButton = document.querySelector('.dropdown-button');
  const dropdownContent = document.querySelector('.dropdown-content');
  const titleAscOrder = document.querySelector('#sortTitleAsc-button');
  const titleDescOrder = document.querySelector('#sortTitleDesc-button');
  const timeAscOrder = document.querySelector('#sortTimeAsc-button');
  const timeDescOrder = document.querySelector('#sortTimeDesc-button');

  const toggleDropdown = () => dropdownContent.classList.toggle('hidden');
  const stopPropagation = (event) => event.stopPropagation();
  const addSortedNotes = (sortFn, order) => async () => addNotesToDocument(await sortFn(order));

  sortByButton.addEventListener('click', toggleDropdown);
  dropdownContent.addEventListener('click', stopPropagation);

  titleAscOrder.addEventListener('click', addSortedNotes(sortNotesByTitle, 'asc'));
  titleDescOrder.addEventListener('click', addSortedNotes(sortNotesByTitle, 'desc'));
  timeAscOrder.addEventListener('click', addSortedNotes(sortNotesByTime, 'asc'));
  timeDescOrder.addEventListener('click', addSortedNotes(sortNotesByTime, 'desc'));
}

/**
 * Initializes the event handler for filtering notes by search query.
 * @param {Object[]} notes - An array of note objects.
 */
export function initSearchBar() {
  const searchBar = document.querySelector('.searchBar');
  searchBar.addEventListener('input', async (event) => {
    const notes = await filterNotesByQuery(event.target.value);
    addNotesToDocument(notes);
  });
}
