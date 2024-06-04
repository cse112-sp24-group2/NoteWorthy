/*
 * noteEditor.js initilizes the functionality and handles the main logic
 * of the note editor page (duh).
 *
 * Functions inside this file:
 *   - addNoteToDocument()
 *   - editNote()
 *   - saveNote()
 *   - addTags()
 *   - initEditor()
 */
import { updateURL, pageData } from './Routing.js';
import { saveNoteToStorage, getNotesFromStorage } from './noteStorage.js';
import { getDate } from './utility.js';
import { exportNote, deleteNote } from './noteFunctions.js';
import { saveTagToStorage } from './tagStorage.js';
import { alertDialog } from './settings.js';

let quill;

/**
 * @description append the notes title, last modified date, and content to page
 * @param {*} note note object with data
 */
export async function addNoteToDocument(note) {
  // select html items
  const title = document.querySelector('#notes-title');
  const lastModified = document.querySelector('#notes-last-modified');
  const intPutArea = document.getElementById('notes-tags');

  // empty the html items
  // populate html with notes data
  title.innerHTML = `<input type="text"
    ${title.classList.contains('dark') ? 'class="dark"' : 'class=""'} id="title-input" placeholder="Untitled Note">`;
  const titleInput = document.querySelector('#title-input');
  titleInput.value = note.title;
  lastModified.innerHTML = `Last Modified: ${note.lastModified}`;
  quill.setContents(note.content);

  const tagInput = document.querySelector('#tag-input');
  tagInput.setAttribute('placeholder', 'Add tag...');

  // append the tags
  const tags = note.tags;
  for (let i = 0; i < tags.length; i += 1) {
    const tagCheckbox = document.createElement('input');
    console.log(tags[i]);
    tagCheckbox.type = 'checkbox';
    tagCheckbox.className = 'tag';
    tagCheckbox.name = tags[i];
    tagCheckbox.checked = true;
    intPutArea.appendChild(tagCheckbox);
    const label = document.createElement('label');
    label.htmlFor = tags[i]; // replace with unique tag identifier
    label.appendChild(document.createTextNode(tags[i]));
    intPutArea.appendChild(label);
  }
}

/**
 * @description toggles note editing when called.
 *
 * @param {Boolean} bool OPTIONAL. toggles if empty, or can directly set it
 * @returns {void} this function does not return a value.
 */
export function editNote(bool) {
  const exportButton = document.querySelector('#export-button');
  const importButton = document.querySelector('#import-button');
  const saveButton = document.querySelector('#save-button');
  const tagButton = document.querySelector('#tag-button');
  const tagInput = document.querySelector('#tag-input');
  const tagCheckBoxes = document.querySelectorAll('input[type=checkbox]');

  const enableEditMode = bool || !pageData.editEnabled;
  pageData.editEnabled = enableEditMode;

  const setButtonState = (button, isEnabled) => {
    /* eslint-disable-next-line */
    button.disabled = !isEnabled;
    button.classList.toggle('disabled-button', !isEnabled);
  };

  const setInputState = (input, isEnabled) => {
    /* eslint-disable-next-line */
    input.disabled = !isEnabled;
    input.classList.toggle('disabled-button', !isEnabled);
  };

  setButtonState(exportButton, !enableEditMode);
  setButtonState(importButton, !enableEditMode);
  setButtonState(saveButton, enableEditMode);
  setButtonState(tagButton, enableEditMode);
  setInputState(tagInput, enableEditMode);

  tagCheckBoxes.forEach((tag) => {
    setInputState(tag, enableEditMode);
  });
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
      const lastModified = getDate();
      const noteObject = {
        title,
        lastModified,
        content,
      };
      await addNoteToDocument(noteObject);
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
  const tagDB = pageData.tagDB;
  const tags = getSelectedTags();
  const noteObject = createNoteObject(tags, id);
  if (!noteObject) return;
  saveNoteToStorage(db, noteObject);
  if (!id) {
    getNotesFromStorage(db).then((res) => {
      window.history.replaceState({}, null, `?id=${res[res.length - 1].uuid}`);
      pageData.noteID = res[res.length - 1].uuid;
    });
  }
  const tagList = document.querySelectorAll('#tag');
  for (let i = 0; i < tagList.length; i += 1) {
    tagList[i].classList.add('disabled-button');
    tagList[i].disabled = false;
  }
  for (let i = 0; i < tags.length; i += 1) {
    const TAG_OBJECT = {
      tag_name: tags[i],
      num_notes: 1,
    };
    saveTagToStorage(tagDB, TAG_OBJECT);
  }
}

/**
 * @description Adds a Tag to note in the Editor page
 *
 * @returns {void} This function does not return a value.
 */
async function addTags() {
  // const id = pageData.noteID;
  // const db = pageData.database;
  const tagname = document.querySelector('#tag-input').value.replace(/\s+/g, ' ').trim();
  if (tagname === '') {
    alertDialog('Please enter a valid tag name', 'alert');
  } else {
    const allTags = [];
    document.querySelectorAll('.tag').forEach((tag) => {
      allTags.push(tag.name);
    });
    console.log(allTags);
    if (allTags.includes(tagname)) {
      alert('Tag already exists');
    } else {
      const parentElement = document.getElementById('notes-tags');
      const newCheckBox = document.createElement('input');
      newCheckBox.type = 'checkbox';
      newCheckBox.checked = true;
      newCheckBox.className = 'tag';
      newCheckBox.name = tagname;
      // newCheckBox.setAttribute('disabled', true);
      parentElement.appendChild(newCheckBox);
      const label = document.createElement('label');
      label.htmlFor = tagname;
      label.appendChild(document.createTextNode(tagname));
      parentElement.appendChild(label);
    }
    // if existing note
    /** 
    if (id) {
      // console.log()
      // access note
      const note = getNoteFromStorage(id);
      console.log(note);
      const tags = note.tags;
      // check to see if note is already tagged
      console.log(tags);
      const contains = tags.includes(tagname);
      if (!contains) {
        note.tags.push(tagname);
        // push HTML element
        const parentElement = document.getElementById('notes-tags');
        const newCheckBox = document.createElement('input');
        const uniqueID = generateRandomString(8); // Unique tag identifier
        newCheckBox.type = 'checkbox';
        newCheckBox.id = uniqueID;
        // newCheckBox.value = 'something <br/>';
        newCheckBox.checked = true;
        newCheckBox.name = tagname;
        parentElement.appendChild(newCheckBox);

        const label = document.createElement('label');
        label.htmlFor = uniqueID;
        label.appendChild(document.createTextNode(tagname));
        parentElement.appendChild(label);

        // storing tag info to be used in saveNote()
        pageData.tags.push(tagname);
        // adding to database
        // db.transaction('NotesOS', 'readwrite').objectStore('note_tags');
        // objectStore.add({tagname, note});
      }
    }
    if (!id) {
      // notes.tags.push(tagname);
      // push HTML element

      // check html elements to see if tag is already there.

      const parentElement = document.getElementById('notes-tags');
      const newCheckBox = document.createElement('input');
      const uniqueID = generateRandomString(8); // Unique tag identifier
      newCheckBox.type = 'checkbox';
      newCheckBox.id = 'tag';
      newCheckBox.value = 'something <br/>';
      newCheckBox.checked = true;
      newCheckBox.name = tagname; // replace with unique tag identifier
      parentElement.appendChild(newCheckBox);

      const label = document.createElement('label');
      label.htmlFor = uniqueID; // replace with unique tag identifier
      label.appendChild(document.createTextNode(tagname));
      parentElement.appendChild(label);

      pageData.tags.push(tagname);
    }
*/
    // if not contained in tag database, then push to that as well.
  }
}

/**
 * @description Initializes the button and functionality of the editor page.
 *
 * @returns {void} This function does not return a value.
 */
export async function initEditor() {
  const deleteButton = document.querySelector('#delete-button');
  const backButton = document.querySelector('#back-button');
  const tagButton = document.querySelector('#tag-button');
  const exportButton = document.querySelector('#export-button');
  const importButton = document.querySelector('#import-button');
  const editContent = document.querySelector('#notes-content');

  // eslint-disable-next-line
  quill = new Quill('#editor', {
    theme: 'snow',
  });

  editContent.addEventListener('click', () => editNote(true));
  deleteButton.addEventListener('click', () => deleteNote());
  backButton.addEventListener('click', () => updateURL(''));
  tagButton.addEventListener('click', () => addTags());
  exportButton.addEventListener('click', () => exportNote());
  importButton.addEventListener('click', () => importNote());
}
