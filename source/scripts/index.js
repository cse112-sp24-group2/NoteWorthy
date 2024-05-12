import { initializeDB, getNotesFromStorage, getNoteFromStorage, deleteNoteFromStorage, saveNoteToStorage  } from './noteStorage.js';
import { setEditable, getDate, addNoteToDocument } from './notesEditor.js'

// Page Data reference to minimize initializeDB calls among other variables
const pageData = {
  database: null,
  noteID: null,
  editEnabled: false,
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
 * @description sort the notes by last modified date
 * @param {Array<Object>} notes containing all the notes in the local storage
 * @param {String} sortType the type of sort, either ascending or descending
 * @returns sortedNotes
 */
function sortNotesByTime(notes, sortType) {
  return notes.sort((note1, note2) => {
    const dateList1 = note1.lastModified.split('/');
    const dateList2 = note2.lastModified.split('/');
    const timeList1 = dateList1[2].split('at ')[1].split(' ');
    const timeList2 = dateList2[2].split('at ')[1].split(' ');
    let hour1;
    let hour2;
    if (timeList1[0].split(':')[0] === '12') {
      hour1 = timeList1[1] === 'AM' ? 0 : 12;
    } else {
      hour1 = timeList1[1] === 'PM' ? parseInt(timeList1[0], 10) + 12 : timeList1[0];
    }
    if (timeList2[0].split(':')[0] === '12') {
      hour2 = timeList2[1] === 'AM' ? 0 : 12;
    } else {
      hour2 = timeList2[1] === 'PM' ? parseInt(timeList2[0], 10) + 12 : timeList2[0];
    }
    const minute1 = timeList1[0].split(':')[1];
    const minute2 = timeList2[0].split(':')[1];
    const date1 = new Date(
      dateList1[2].split('at ')[0],
      dateList1[0] - 1,
      dateList1[1],
      hour1,
      minute1
    );
    const date2 = new Date(
      dateList2[2].split('at ')[0],
      dateList2[0] - 1,
      dateList2[1],
      hour2,
      minute2
    );
    if (sortType === 'asc') {
      return date1 - date2;
    }
    return date2 - date1;
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
    (note) => note.title.toLowerCase().includes(queryString)
      || note.lastModified.replace('at', '').toLowerCase().includes(queryString)
  );
}

/**
 * @description Add necessary event handlers for the buttons on page
 */
async function initEventHandler() {
  const button = document.querySelector('#newNote');
  const db = pageData.database;
  const notes = await getNotesFromStorage(db);

  // navigate the to editor page for new note
  button.addEventListener('click', async () => {
    // HACK: need to change and handle proper URL
    updateURL('?id=9999');
  });

  const h1 = document.querySelector('.header > h1');
  h1.addEventListener('click', async () => {
    updateURL('');
  });

  // Handle notes sorting on column header clicks
  const timeColSortArrow = document.querySelector('.timeColSortOrder');
  const titleColSortArrow = document.querySelector('.titleColSortOrder');
  // sort the notes to display in dashboard by last modified date
  const timeCol = document.querySelector('.timeCol');
  let timeSortCount = 0;
  timeCol.addEventListener('click', async () => {
    const direction = timeSortCount % 2 === 0 ? 'asc' : 'desc';
    titleColSortArrow.setAttribute('direction', '');
    timeColSortArrow.setAttribute('direction', direction);
    timeSortCount += 1;
    addNotesToDocument(sortNotesByTime(notes, direction));
  });

  // sort the notes to display in dashboard by title
  const titleCol = document.querySelector('.titleCol');
  let titleSortCount = 0;
  titleCol.addEventListener('click', async () => {
    const direction = titleSortCount % 2 === 0 ? 'asc' : 'desc';
    timeColSortArrow.setAttribute('direction', '');
    titleColSortArrow.setAttribute('direction', direction);
    titleSortCount += 1;
    addNotesToDocument(sortNotesByTitle(notes, direction));
  });

  const searchBar = document.querySelector('.searchBar');
  searchBar.addEventListener('input', (event) => {
    console.log(event.target.value);
    addNotesToDocument(filterNotesByQuery(notes, event.target.value));
  });

  // Window event listener to detech when URL changes since converting to SPA
  let currURL = window.location.search;
  window.addEventListener('popstate', () => {
    const newURL = window.location.search;
    if (newURL !== currURL) {
      currURL = newURL;
      URLRoutingHandler();
    }
  })
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
  })

  editButton.addEventListener('click', () => {
    editNote();
  })
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
    content,
  };
  if (id) {
    noteObject.uuid = id;
  }
  saveNoteToStorage(db, noteObject);
  if (!id) {
    // Navigate to the saved note page if we're saving a brand new note
    getNotesFromStorage(db).then((res) => {
      window.history.replaceState({}, null, `?id=${res[res.length - 1].uuid}`)
      // updateURL(`?id=${res[res.length - 1].uuid}`); 
    });
  }
  // Switch to preview mode
  editNote(false);
  // Disable save button after clicking it
  saveButton.classList.add('disabled-button');
  saveButton.disabled = true;
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

  if (id) {
    if (window.confirm('Are you sure you want to delete')) {
      deleteNoteFromStorage(db, { uuid: id })
      if (!toDelete) updateURL('');
    }
  }
}

/**
 * @description handles url routing, checks url parameters and loads
 *              dashboard or editor accordingly
 */
function URLRoutingHandler() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');

  if (id == '9999' || id == null) {
    pageData.noteID = null;
  } else {
    pageData.noteID = parseInt(id, 10);
  }

  console.log(pageData.noteID);

  // So that child functions can hide/unhide dashboard or editor
  const dom = {
    editor: document.querySelector(".editor"),
    dashboard: document.querySelector(".dashboard"),
  }

  if (id == null) {
    switchToDashboard(dom);
  } else {
    switchToEditor(parseInt(id, 10), dom);
  }
}

/**
 * @description Switches current view to editor
 * @param {Number} id note id
 * @param {dom references} dom to hide/unhide dashboard and editor
 */
async function switchToEditor(id, dom) {
  console.log(`switching to editor`)
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
 * @description Switches current view to dashboard
 * @param {dom references} dom to hide/unhide dashboard and editor
 */
async function switchToDashboard(dom) {
  console.log(`switching to dashboard`)
  const db = pageData.database;
  const notes = await getNotesFromStorage(db);
  addNotesToDocument(notes);
  dom.editor.classList.add('hidden');
  dom.dashboard.classList.remove('hidden');
}


/**
 * @description Updates the URL to signify page changing. 
 *              Window eventlisteners will automatically detect the change.
 * @param {String} urlString "" for dashboard for "?id={number}" for edit page.
 */
export function updateURL(urlString) {
  if (urlString == '') urlString = '/';
  window.history.pushState({}, null, urlString);
  window.dispatchEvent(new Event('popstate'));
}

/**
 * @description call all the functions after the DOM is loaded
 */
async function init() {
  pageData.database = await initializeDB(indexedDB);
  URLRoutingHandler();
  initEditor();
  await initEventHandler();
}

window.addEventListener('DOMContentLoaded', init);
