import { saveNoteToStorage, getNotesFromStorage, deleteNoteFromStorage } from './noteStorage.js';
import markdown from './markdown.js';
import {getTagsFromStorage, saveTagToStorage} from './tagStorage.js';

/**
 * @description get the current date and time for the dashboard
 * @returns {string} current date in format of mm/dd/yyyy at XX:XX XM
 */
export function getDate() {
  const date = new Date();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();
  const time = date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${month}/${day}/${year} at ${time}`;
}

/**
 * @description Switches between edit/view modes on the page
 * @param {*} editable True for edit mode, false for preview mode
 */
export function setEditable(editable) {
  const editContent = document.querySelector('#edit-content');
  const viewContent = document.querySelector('#view-content');
  const titleInput = document.querySelector('#title-input');
  const saveButton = document.querySelector('#save-button');
  if (!editable) {
    viewContent.innerHTML = markdown(editContent.value);
    viewContent.hidden = false;
    editContent.hidden = true;
    titleInput.setAttribute('disabled', true);
  } else {
    editContent.hidden = false;
    viewContent.hidden = true;
    titleInput.removeAttribute('disabled');
  }

  saveButton.classList.remove('disabled-button');
  saveButton.disabled = false;
}
/**
 * @description Initialize the button that toggles between edit and preview modes
 * @param {boolean} editEnabled True if the note is initially in edit mode, false if in preview mode
 */
export function initEditToggle(editEnabled) {
  const editButton = document.querySelector('#change-view-button');
  const saveButton = document.querySelector('#save-button');
  const tagButton = document.querySelector('#tag-button');
  const tagInput = document.querySelector('#tag-input');
  const tagList = document.querySelectorAll('#tag');
  if (editEnabled) {
    editButton.innerHTML = 'Preview';
  } else {
    editButton.innerHTML = 'Edit';
  }
  setEditable(editEnabled);
  editButton.onclick = async () => {
    saveButton.classList.remove('disabled-button');
    saveButton.disabled = false;
    tagButton.classList.remove('disabled-button');
    tagButton.disabled = false;
    tagInput.classList.remove('disabled-button');
    tagInput.disabled = false;
    for(let i = 0; i < tagList.length; i++ ){
      tagList[i].classList.remove('disabled-button');
      tagList[i].disabled = false;
    }

    const editActive = editButton.innerHTML === 'Edit';
    setEditable(editActive);
    if (editActive) {
      editButton.innerHTML = 'Preview';
    } else {
      editButton.innerHTML = 'Edit';
    }
  };
}

/**
 * @description append the tag button to the page
 * @param {Integer} id unique uuid of current note
 * @param {*} db The initialized indexedDB object.
 */
function initTagButton(id, db) {
  const tagButton = document.querySelector('#tag-button');
  
}

function displayTags() {

}

/**
 * @description Deletes the current note and returns to the dashboard.
 * @param {Integer} id unique uuid of current note
 * @param {*} db The initialized indexedDB object.
 */
export function initDeleteButton(id, db) {
  const deleteButton = document.querySelector('#delete-button');
  if (!id) {
    deleteButton.classList.add('disabled-button');
    deleteButton.disabled = true;
  }
  deleteButton.addEventListener('click', () => {
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



/**
 * @description append the notes title, last modified date, and content to page
 * @param {*} note note object with data
 */
export async function addNoteToDocument(note) {
  // select html items
  const title = document.querySelector('#notes-title');
  const lastModified = document.querySelector('#notes-last-modified');
  const content = document.querySelector('#edit-content');
  // empty the html items
  // populate html with notes data
  title.innerHTML = '<input type="text" id="title-input" placeholder = "Untitled Note">';
  const titleInput = document.querySelector('#title-input');
  titleInput.value = note.title;
  lastModified.innerHTML = `Last Modified: ${note.lastModified}`;
  content.value = `${note.content}`;
}
