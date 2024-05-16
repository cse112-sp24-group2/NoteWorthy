import {
  initializeDB,
  getNotesFromStorage,
  getNoteFromStorage,
  deleteNoteFromStorage,
  saveNoteToStorage,
} from './noteStorage.js';
import { setEditable, getDate, addNoteToDocument } from './notesEditor.js';
import { getTagsFromStorage, initializeTagDB } from './tagStorage.js';

// Page Data reference to minimize initializeDB calls among other variables
const pageData = {
  database: null,
  noteID: null,
  editEnabled: false,
  tagDB: null,
  tags: [],
};

/**
 * @description append the new row to the dashboard in the document
 * @param {Array<Object>} notes containing all the notes in the local storage
 */
function addNotesToDocument(notes) {
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
 * 
 * 
 **/
function addTagsToDocument(tags) {
  const tagList = document.querySelector('#tag-list');
  tags.forEach((tag) => {
    const tagButton = document.createElement('button');
    tagButton.textContent = tag.tag_name;
    tagButton.classList.add('tag-button');
    tagButton.type = 'radio';
    tagList.appendChild(tagButton);
  });
}

/**
 * @description Show/Hide empty notes on dashboard
 * @param {bool} bool true to hide, false to show
 */
function hideEmptyWojak(bool) {
  const empty = document.querySelector('.empty-dashboard');
  empty.classList.toggle('hidden', bool);
}

/**
 * @description Updates the URL to signify page changing.
 *              Window eventlisteners will automatically detect the change.
 * @param {String} urlString "" for dashboard for "?id={number}" for edit page.
 */
export default function updateURL(urlString) {
  const path = window.location.pathname;
  window.history.pushState({}, null, path + urlString);
  window.dispatchEvent(new Event('popstate'));
}

/**
 * @description Parse the note date string into a Date object
 * @param {String} dateString - The date string in the format 'MM/DD/YYYYat HH:MM AM/PM'
 * @returns {Date} The parsed Date object
 */
function parseNoteDate(dateString) {
  const [month, day, dateTimeString] = dateString.split('/');
  const [date, timeString] = dateTimeString.split('at ');
  const [hour, minute, ampm] = timeString.trim().split(/[: ]/);

  let parsedHour = parseInt(hour, 10);
  if (parsedHour === 12) {
    parsedHour = ampm === 'PM' ? 12 : 0;
  } else {
    parsedHour = ampm === 'PM' ? parsedHour + 12 : parsedHour;
  }

  return new Date(date, parseInt(month, 10) - 1, parseInt(day, 10), parsedHour, parseInt(minute, 10));
}

/**
 * @description Sort the notes by last modified date
 * @param {Array<Object>} notes - Array containing all the notes in local storage
 * @param {String} sortType - The type of sort, either 'asc' for ascending or 'desc' for descending
 * @returns {Array<Object>} Sorted array of notes
 */
function sortNotesByTime(notes, sortType) {
  const sortOrder = sortType === 'asc' ? 1 : -1;

  return notes.sort((note1, note2) => {
    const date1 = parseNoteDate(note1.lastModified);
    const date2 = parseNoteDate(note2.lastModified);

    return (date1 - date2) * sortOrder;
  });
}

/**
 * @description sort the notes by title
 * @param {Array<Object>} notes containing all the notes in the local storage
 * @param {String} sortType the type of sort, either ascending or descending
 * @returns sortedNotes
 */
function sortNotesByTitle(notes, sortType) {
  return notes.sort((note1, note2) => {
    if (sortType === 'asc') {
      return note1.title.localeCompare(note2.title);
    }
    return note2.title.localeCompare(note1.title);
  });
}

/**
 * @description Return the notes that match the query string. Case insensitive.
 * @param {Array<Object>} notes Array containing all the notes in local storage
 * @param {String} query The search string to filter the notes on
 * @returns filtered notes array
 */
function filterNotesByQuery(notes, query) {
  const queryString = query.toLowerCase().replace(/\s+/g, ' ').trim();
  return notes.filter(
    (note) =>
      note.title.toLowerCase().includes(queryString) ||
      note.lastModified.replace('at', '').toLowerCase().includes(queryString)
  );
}

/**
 * @description toggles note editing when called.
 * @param {Boolean} bool OPTIONAL. toggles if empty, or can directly set it
 */
function editNote(bool) {
  const editButton = document.querySelector('#change-view-button');
  pageData.editEnabled = bool || !pageData.editEnabled; // Toggles the value
  const edit = pageData.editEnabled;

  if (edit) {
    editButton.innerHTML = 'Preview';
  } else {
    editButton.innerHTML = 'Edit';
  }

  setEditable(edit);
}

/**
 * @description Switches current view to dashboard
 * @param {HTMLElement} dom to hide/unhide dashboard and editor
 */
async function switchToDashboard(dom) {
  const db = pageData.database;
  const notes = await getNotesFromStorage(db);
  addNotesToDocument(notes);
  dom.editor.classList.add('hidden');
  dom.dashboard.classList.remove('hidden');
  hideEmptyWojak(notes.length !== 0);
}

/**
 * @description Switches current view to editor
 * @param {Number} id note id
 * @param {HTMLElement} dom to hide/unhide dashboard and editor
 */
async function switchToEditor(id, dom) {
  if (id !== 9999) {
    const db = pageData.database;
    const note = await getNoteFromStorage(db, id);
    pageData.editEnabled = false;
    addNoteToDocument(note);
    setEditable(pageData.editEnabled);
  } else {
    const noteObject = {
      title: '',
      lastModified: `${getDate()}`,
      content: '',
    };
    await addNoteToDocument(noteObject);
    editNote(true);
  }

  dom.editor.classList.remove('hidden');
  dom.dashboard.classList.add('hidden');
}

/**
 * @description handles url routing, checks url parameters and loads
 *              dashboard or editor accordingly
 */
function URLRoutingHandler() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');

  if (id === '9999' || id == null) {
    pageData.noteID = null;
  } else {
    pageData.noteID = parseInt(id, 10);
  }

  // So that child functions can hide/unhide dashboard or editor
  const dom = {
    editor: document.querySelector('.editor'),
    dashboard: document.querySelector('.dashboard'),
  };

  if (id == null) {
    switchToDashboard(dom);
  } else {
    switchToEditor(parseInt(id, 10), dom);
  }
}

/**
 * @description Saves note to the database. Makes sure title is valid
 *              and handles cases when the note is new or already existing
 */
function saveNote() {
  const db = pageData.database;
  const id = pageData.noteID;
  const title = document.querySelector('#title-input').value.replace(/\s+/g, ' ').trim();
  if (title === '') {
    alert('Please enter a valid title.');
    return;
  }
  const saveButton = document.querySelector('#save-button');
  const content = document.querySelector('#edit-content').value;
  const lastModified = getDate();
  const noteObject = {
    title,
    lastModified,
    tags:[],
    content,
  };
  if (id) noteObject.uuid = id;
  saveNoteToStorage(db, noteObject);
  if (!id) {
    // replace current url with new note id
    getNotesFromStorage(db).then((res) => {
      window.history.replaceState({}, null, `?id=${res[res.length - 1].uuid}`);
    });
  }
  editNote(false); // Switch to preview mode
  // Disable save button after clicking it
  saveButton.classList.add('disabled-button');
  saveButton.disabled = true;




   // Disable tag button after clicking save
   const tagButton = document.querySelector('#tag-button');
   tagButton.classList.add('disabled-button');
   tagButton.disabled = true;
   // Disable tag input after clicking save
   const tagInput = document.querySelector('#tag-input');
   tagInput.classList.add('disabled-button');
   tagInput.disabled = true;

   const tagList = document.querySelectorAll('#tag');
   for(let i = 0; i < tagList.length; i++ ){
     tagList[i].classList.add('disabled-button');
     tagList[i].disabled = true;
   }

}

/**
 * @description Deletes the note
 * @param {Number} toDelete OPTIONAL. Do not pass a ID if you are currently in
 *                                    the editor page, ID will be handled automatically.
 *                                    Only pass ID when deleting note from dashboard
 */
function deleteNote(toDelete) {
  const id = toDelete || pageData.noteID;
  const db = pageData.database;

  if (!id) return;
  if (!window.confirm('Are you sure you want to delete')) return;

  deleteNoteFromStorage(db, { uuid: id });

  // This means we are deleting from the editor page, so we should return
  // to the dashboard
  if (!toDelete) updateURL('');
}

/**
 * @description Initializes the button and functionality of the editor page.
 */
async function initEditor() {
  const deleteButton = document.querySelector('#delete-button');
  const saveButton = document.querySelector('#save-button');
  const backButton = document.querySelector('#back-button');
  const editButton = document.querySelector('#change-view-button');

  deleteButton.addEventListener('click', () => {
    deleteNote();
  });

  saveButton.addEventListener('click', () => {
    saveNote();
  });

  backButton.addEventListener('click', () => {
    updateURL('');
  });

  editButton.addEventListener('click', () => {
    editNote();
  });

  // const tagButton = document.querySelector('#tag-button');
  // const tagInput = document.querySelector('#tag-input');
  // const tagList = document.querySelectorAll('#tag');
  // saveButton.classList.add('disabled-button');
  // saveButton.disabled = true;
  // tagButton.classList.add('disabled-button');
  // tagButton.disabled = true;
  // tagInput.classList.add('disabled-button');
  // tagInput.disabled = true;
  // for(let i = 0; i < tagList.length; i++ ){
  //   tagList[i].classList.add('disabled-button');
  //   tagList[i].disabled = true;
  // }
}

/**
 * Initializes the event handler for sorting notes by time column.
 * @param {Object[]} notes - An array of note objects.
 */
function initTimeColumnSorting(notes) {
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
function initTitleColumnSorting(notes) {
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
 * Initializes the event handler for filtering notes by search query.
 * @param {Object[]} notes - An array of note objects.
 */
function initSearchBar(notes) {
  const searchBar = document.querySelector('.searchBar');
  searchBar.addEventListener('input', (event) => {
    console.log(event.target.value);
    addNotesToDocument(filterNotesByQuery(notes, event.target.value));
  });
}

/**
 * @description Add necessary event handlers for the buttons on page
 */
async function initEventHandler() {
  const db = pageData.database;
  const notes = await getNotesFromStorage(db);

  const button = document.querySelector('#newNote');
  button.addEventListener('click', async () => {
    // HACK: need to change and handle proper URL
    updateURL('?id=9999');
  });

  const h1 = document.querySelector('.header > h1');
  h1.addEventListener('click', async () => {
    updateURL('');
  });

  initTimeColumnSorting(notes);
  initTitleColumnSorting(notes);
  initSearchBar(notes);

  let currURL = window.location.search;
  window.addEventListener('popstate', () => {
    const newURL = window.location.search;
    if (newURL !== currURL) {
      currURL = newURL;
      URLRoutingHandler();
    }
  });
}

/**
 * @description call all the functions after the DOM is loaded
 */
async function init() {
  console.log('%cWelcome to %cNoteWorthy. ', '', 'color: #D4C1EC; font-weight: bolder; font-size: 0.8rem', '');
  pageData.database = await initializeDB(indexedDB);
  pageData.tagDB = await initializeTagDB(indexedDB);
  pageData.tags = await getTagsFromStorage(pageData.tagDB);
  URLRoutingHandler();
  initEditor();

  await initEventHandler();
  // addTagsToDocument(tags); PUT IN INIT EVENT HANDLER

}

window.addEventListener('DOMContentLoaded', init);
