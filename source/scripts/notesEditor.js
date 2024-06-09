/*
 * noteEditor.js initilizes the functionality and handles the main logic
 * of the note editor page (duh).
 *
 * Functions inside this file:
 *   - addNoteToDocument()
 *   - saveNote()
 *   - addTags()
 *   - initEditor()
 */
import { updateURL, pageData } from './Routing.js';
import { saveNoteToStorage, getNotesFromStorage } from './noteStorage.js';
import { getDate } from './utility.js';
import { exportNote, deleteNote } from './noteFunctions.js';
import { getTagFromStorage, saveTagToStorage, updateTagNumNotes } from './tagStorage.js';
import { alertDialog } from './settings.js';

let quill;

/**
 * @description Adds a note to the document by populating relevant HTML elements with note data.
 *
 * @param {Object} note - The note object containing note data.
 * @param {string} note.title - The title of the note.
 * @param {string} note.lastModified - The last modified date of the note.
 * @param {Object} note.content - The content of the note, formatted for Quill editor.
 * @returns {Promise<void>} This function does not return a value.
 */
export async function addNoteToDocument(note) {
  // select html items
  const title = document.querySelector('#notes-title');
  const lastModified = document.querySelector('#notes-last-modified');

  // empty the html items
  // populate html with notes data
  title.innerHTML = `<input type="text"
  ${title.classList.contains('dark') ? 'class="dark"' : 'class=""'} id="title-input" placeholder="Untitled Note">`;
  const titleInput = document.querySelector('#title-input');
  titleInput.value = note.title;
  lastModified.innerHTML = `Last Modified: ${note.lastModified}`;
  quill.setContents(note.content);
}

/**
 * @description Imports a note from a file and writes its content to the
 * editor, setting the title and last modified date.
 *
 * @returns {void} This function does not return a value.
 */
function importNote() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.txt';
  input.click();

  input.onchange = async () => {
    const file = input.files[0];
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = async () => {
      const content = reader.result;
      const title = file.name.replace('.txt', '');
      const lastModifiedVal = getDate();

      const titleInput = document.querySelector('#title-input');
      titleInput.value = title;
      const lastModified = document.querySelector('#notes-last-modified');
      lastModified.innerHTML = `Last Modified: ${lastModifiedVal}`;

      // set quill contents
      quill.setText(content);
    };
  };
}

/**
 * @description Retrieves the selected tags from the form.
 *
 * @returns {string[]} An array of selected tag names.
 */
function getSelectedTags() {
  const elements = document.getElementById('notes-tags').elements;
  const tags = [];
  for (let i = 0; i < elements.length; i += 1) {
    const currElement = elements[i];
    if (currElement.type === 'checkbox' && currElement.checked === true) {
      tags.push(currElement.name);
    }
  }
  return tags;
}

/**
 * @description Creates a note object from the form data.
 *
 * @param {string[]} tags - An array of selected tag names.
 * @param {string} id - The note ID (optional).
 *
 * @returns {Object} A note object.
 */
function createNoteObject(tags, id) {
  const title = document.querySelector('#title-input').value.replace(/\s+/g, ' ').trim();

  if (title === '' && quill.getLength() === 1 && tags.length === 0) {
    updateURL('');
    return null;
  }

  if (title === '') {
    alertDialog('Please enter a valid title');
    return null;
  }

  const content = quill.getContents();
  const htmlContent = quill.getSemanticHTML();
  const lastModified = getDate();

  const noteObject = {
    title,
    lastModified,
    tags,
    content,
    htmlContent,
  };

  if (id) noteObject.uuid = id;

  return noteObject;
}

/**
 * @description Saves the note content and updates the URL with the new note ID.
 *
 * @returns {void} This function does not return a value.
 */
export function saveNote() {
  const db = pageData.database;
  const id = pageData.noteID;
  const tags = getSelectedTags();
  const noteObject = createNoteObject(tags, id);
  if (!noteObject || noteObject == null) return false;
  saveNoteToStorage(db, noteObject);
  if (!id) {
    getNotesFromStorage(db).then((res) => {
      // The new note that is created is always the last in the list
      pageData.noteID = res[res.length - 1].uuid;
    });
  }
  return true;
}

/**
 * @description Retrieves all tags from the given IndexedDB object store.
 *
 * @param {IDBObjectStore} tagDBObjectStore - The IndexedDB object store to retrieve tags from.
 * @returns {Promise<Array<string>>} A promise that resolves with an array of tag keys.
 */
function getAllTagsFromStorage(tagDBObjectStore) {
  return new Promise((resolve, reject) => {
    const allTagsRequest = tagDBObjectStore.getAllKeys();
    const allTags = [];

    allTagsRequest.onsuccess = () => {
      for (let i = 0; i < allTagsRequest.result.length; i += 1) {
        allTags.push(allTagsRequest.result[i]);
      }
      resolve(allTags);
    };

    allTagsRequest.onerror = () => {
      reject(allTagsRequest.error);
    };
  });
}

/**
 * @description Adds a Tag to note in the Editor page
 *
 * @returns {void} This function does not return a value.
 */
async function addTags() {
  const tagDB = pageData.tagDB;
  const tagname = document.querySelector('#tag-input').value.replace(/\s+/g, ' ').trim();
  if (tagname === '') {
    alertDialog('Please enter a valid tag name', 'alert');
    return;
  }
  const tagDBObjectStore = tagDB.transaction('tags', 'readwrite').objectStore('tags');
  const allTags = await getAllTagsFromStorage(tagDBObjectStore);

  if (allTags.includes(tagname)) alert('Tag already exists');

  const parentElement = document.getElementById('notes-tags');
  const newCheckBox = document.createElement('input');
  newCheckBox.type = 'checkbox';
  newCheckBox.checked = true;
  newCheckBox.className = 'editor-tag-checkbox';
  newCheckBox.name = tagname;
  newCheckBox.addEventListener('change', () => {
    updateTagNumNotes(tagDB, tagname, newCheckBox.checked);
  });
  const label = document.createElement('label');
  label.htmlFor = `tag-${tagname}`;
  label.className = 'editor-tag-label';

  const tagNameSpan = document.createElement('span');
  tagNameSpan.className = 'editor-tag-name';
  tagNameSpan.textContent = tagname;

  label.appendChild(newCheckBox);
  label.appendChild(tagNameSpan);
  parentElement.appendChild(label);

  // add to the storage.
  const TAG_OBJECT = {
    tag_name: tagname,
    num_notes: 1,
  };
  // get Tag from storage. see if its new or not.
  const tagExists = await getTagFromStorage(tagDB, tagname);

  saveTagToStorage(tagDB, TAG_OBJECT, tagExists, true);
}

/**
 * @description Initializes the button and functionality of the editor page.
 *
 * @returns {void} This function does not return a value.
 */
export async function initEditor() {
  const deleteButton = document.querySelector('#delete-button');
  const backButton = document.querySelector('#back-button');
  const exportButton = document.querySelector('#export-button');
  const importButton = document.querySelector('#import-button');
  const tagInput = document.querySelector('#tag-input');

  // eslint-disable-next-line
  quill = new Quill('#editor', {
    theme: 'snow',
  });

  deleteButton.addEventListener('click', () => deleteNote());
  backButton.addEventListener('click', () => {
    if (saveNote()) updateURL('');
  });
  exportButton.addEventListener('click', () => exportNote());
  importButton.addEventListener('click', () => importNote());
  tagInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addTags();
      tagInput.value = '';
    }
  });
}
