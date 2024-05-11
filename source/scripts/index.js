import { initializeDB, getNotesFromStorage, getNoteFromStorage, deleteNoteFromStorage  } from './noteStorage.js';
import { setEditable, addNoteToDocument, initEditToggle, initDeleteButton, initSaveButton   } from './notesEditor.js'

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
    row.shadowRoot
      .querySelector('.note-title')
      .addEventListener('click', async () => {
        window.location.href = `./notes.html?id=${note.uuid}`;
      });
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
  const db = await initializeDB(indexedDB);
  const notes = await getNotesFromStorage(db);
  // navigate to note page in order for the user to write note
  button.addEventListener('click', async () => {
    updateURL('?id=1');
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

async function initEditor() {
  const db = await initializeDB(indexedDB);
  const deleteButton = document.querySelector('#delete-button');

  deleteButton.addEventListener('click', () => {
    const id = deleteButton.datasets.id;
    if (id) {
      // Only do this if the id has already been saved;
      // otherwise return directly to the dashboard
      if (window.confirm('Are you sure you want to delete this note?')) {
        deleteNoteFromStorage(db, { uuid: id });
        window.location.href = './index.html';
      }
    }
  });
}

async function initSave() {
  const db = await initializeDB(indexedDB);
  const saveButton = document.querySelector('#save-button');
  // add event listener to save button
  saveButton.addEventListener('click', () => {
    const title = document.querySelector('#title-input').value.replace(/\s+/g, ' ').trim();
    if (title === '') {
      alert('Please enter a valid title.');
    } else {
      const content = document.querySelector('#edit-content').value;
      const lastModified = getDate();
      const noteObject = {
        title,
        lastModified,
        content,
      };
      const id = saveButton.datasets.id;
      if (id) {
        noteObject.uuid = id;
      }
      saveNoteToStorage(db, noteObject);
      if (!id) {
        // Navigate to the saved note page if we're saving a brand new note
        getNotesFromStorage(db).then((res) => {
          updateURL(`?id=${res[res.length - 1].uuid}`);
        });
      }
      // Switch to preview mode
      initEditToggle(false);
      setEditable(false);
      // Disable save button after clicking it
      saveButton.classList.add('disabled-button');
      saveButton.disabled = true;
    }
  });
}

export function initBackButton() {
  const backButton = document.querySelector('#back-button');
  
  backButton.addEventListener('click', () => {
    const editContent = document.querySelector('#edit-content');
    const titleInput = document.querySelector('#title-input');
    const saveButton = document.querySelector('#save-button');
    const oldTitleInput = titleInput.value;
    const oldNoteBody = editContent.value;
    if (
      saveButton.disabled !== true
        && (titleInput.value !== '' || editContent.value !== '')
        && (titleInput.value !== oldTitleInput || oldNoteBody !== editContent.value)
    ) {
      if (!window.confirm('Are you sure you want to return to the main dashboard? Your note will not be saved.')) {
        return;
      } else {
        updateURL('')
      }
    } else {
      updateURL('')
    }
  })
}

/**
 * @description handles url routing, checks url parameters and loads
 *              dashboard or editor accordingly
 */
function URLRoutingHandler() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id')

  // So that child functions can hide/unhide dashboard or editor
  const dom = {
    editor: document.querySelector(".editor"),
    dashboard: document.querySelector(".dashboard"),
  }

  if (id == null) {
    switchToDashboard(dom)
  } else {
    switchToEditor(parseInt(id, 10), dom)
  }
}

/**
 * @description Switches current view to editor
 * @param {Number} id note id
 * @param {dom references} dom to hide/unhide dashboard and editor
 */
async function switchToEditor(id, dom) {
  console.log(`switching to editor`)

  if (id) {
    const db = await initializeDB(indexedDB);
    const note = await getNoteFromStorage(db, id);
    addNoteToDocument(note);
    initDeleteButton(id, db);
    initSaveButton(id, db);
    initBackButton();
  }

  dom.editor.classList.remove('hidden');
  dom.dashboard.classList.add('hidden');
}

async function switchToDashboard(dom) {
  console.log(`switching to dashboard`)
  const db = await initializeDB(indexedDB);
  const notes = await getNotesFromStorage(db);
  addNotesToDocument(notes);
  dom.editor.classList.add('hidden');
  dom.dashboard.classList.remove('hidden');
}

export function updateURL(urlString) {
  if (urlString == '') urlString = '/';
  window.history.pushState({}, null, urlString);
  window.dispatchEvent(new Event('popstate'));
}

/**
 * @description call all the functions after the DOM is loaded
 */
async function init() {
  URLRoutingHandler();
  await initEventHandler();
}

window.addEventListener('DOMContentLoaded', init);
