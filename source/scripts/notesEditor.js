/*
 * noteEditor.js initilizes the functionality and handles the main logic
 * of the note editor page (duh).
 *
 * Functions inside this file:
 *   - setEditable()
 *   - addNoteToDocument()
 *   - editNote()
 *   - saveNote()
 *   - addTags()
 *   - initEditor()
 */
import { updateURL, pageData } from './Routing.js';
import markdown from './markdown.js';
import { saveNoteToStorage, getNotesFromStorage, getNoteFromStorage } from './noteStorage.js';
import { generateRandomString, getDate } from './utility.js';
import { exportNote, deleteNote } from './noteFunctions.js';

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
    saveButton.classList.add('disabled-button');
    saveButton.disabled = true;
  } else {
    editContent.hidden = false;
    viewContent.hidden = true;
    titleInput.removeAttribute('disabled');
    saveButton.classList.remove('disabled-button');
    saveButton.disabled = false;
  }
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
  const intPutArea = document.getElementById('notes-tags');
  const tag = document.createElement('input');

  // empty the html items
  // populate html with notes data
  title.innerHTML = '<input type="text" id="title-input" placeholder = "Untitled Note">';
  const titleInput = document.querySelector('#title-input');
  titleInput.value = note.title;
  lastModified.innerHTML = `Last Modified: ${note.lastModified}`;
  content.value = `${note.content}`;

  // append the tags
  const tags = note.tags;
  console.log(note);
  for (let i = 0; i < tags.length; i += 1) {
    tag.type = 'checkbox';
    tag.id = 'tag';
    tag.name = tags[i];
    intPutArea.appendChild(tag);

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
  const editButton = document.querySelector('#change-view-button');
  const exportButton = document.querySelector('#export-button');
  const saveButton = document.querySelector('#save-button');
  pageData.editEnabled = bool || !pageData.editEnabled; // Toggles the value
  const edit = pageData.editEnabled;

  if (edit) {
    editButton.firstChild.src = './images/edit-note.svg';
    exportButton.classList.add('disabled-button');
    exportButton.disabled = true;
    saveButton.classList.remove('disabled-button');
    saveButton.disabled = false;
  } else {
    editButton.firstChild.src = './images/preview-note.svg';
    exportButton.classList.remove('disabled-button');
    exportButton.disabled = false;
    saveButton.classList.add('disabled-button');
    saveButton.disabled = true;
  }

  setEditable(edit);
}

/**
 * @description Saves the note content and updates the URL with the new note ID.
 *
 * @returns {void} This function does not return a value.
 */
export function saveNote() {
  const db = pageData.database;
  const id = pageData.noteID;
  const title = document.querySelector('#title-input').value.replace(/\s+/g, ' ').trim();
  if (title === '') {
    alert('Please enter a valid title.');
    return;
  }
  const content = document.querySelector('#edit-content').value;
  const lastModified = getDate();
  // TODO: Need to add tags
  const noteObject = {
    title,
    lastModified,
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

  // Disable tag button after clicking save
  const tagButton = document.querySelector('#tag-button');
  tagButton.classList.add('disabled-button');
  tagButton.disabled = true;
  // Disable tag input after clicking save
  const tagInput = document.querySelector('#tag-input');
  tagInput.classList.add('disabled-button');
  tagInput.disabled = true;

  const tagList = document.querySelectorAll('#tag');
  for (let i = 0; i < tagList.length; i += 1) {
    tagList[i].classList.add('disabled-button');
    tagList[i].disabled = true;
  }

  //  const tagData = pageData.tagDB;
  //  // adding tags to the databases
  //  for(let i = 0; i < pageData.tags.length; i++) {
  //   // if tag already exists in tagDB, increment the assoc count
  //   if() {

  //   }
  //   else {
  //     // create tag in database with value 1.
  //   }
  //  }
}

/**
 * @description Adds a Tag to note in the Editor page
 *
 * @returns {void} This function does not return a value.
 */
function addTags() {
  const id = pageData.noteID;
  // const db = pageData.database;
  const tagname = document.querySelector('#tag-input').value.replace(/\s+/g, ' ').trim();
  if (tagname === '') {
    alert('Please enter a valid tag name');
  } else {
    // if existing note
    if (id) {
      // access note
      const note = getNoteFromStorage(id);
      const tags = note.tags;
      let contains = false;
      // check to see if note is already tagged
      for (let i = 0; i < tags.length; i += 1) {
        if (tags[i] === tagname) {
          alert('Note already tagged with'); // + tagname
          contains = true;
        }
      }
      if (!contains) {
        note.tags.push(tagname);
        // push HTML element
        const parentElement = document.getElementById('notes-tags');
        const newCheckBox = document.createElement('input');
        const uniqueID = generateRandomString(8); // Unique tag identifier
        newCheckBox.type = 'checkbox';
        newCheckBox.id = uniqueID;
        newCheckBox.value = 'something <br/>';
        newCheckBox.name = uniqueID;
        parentElement.appendChild(newCheckBox);

        const label = document.createElement('label');
        label.htmlFor = uniqueID;
        label.appendChild(document.createTextNode(tagname));
        parentElement.appendChild(label);

        pageData.tags.push(tagname);
        // adding to database
        // db.transaction('NotesOS', 'readwrite').objectStore('note_tags');
        // objectStore.add({tagname, note});
      }
    }
    if (!id) {
      // notes.tags.push(tagname);
      // push HTML element
      const parentElement = document.getElementById('notes-tags');
      const newCheckBox = document.createElement('input');
      newCheckBox.type = 'checkbox';
      newCheckBox.id = 'tag';
      newCheckBox.value = 'something <br/>';
      newCheckBox.name = 'tag43'; // replace with unique tag identifier
      parentElement.appendChild(newCheckBox);

      const label = document.createElement('label');
      label.htmlFor = 'tag43'; // replace with unique tag identifier
      label.appendChild(document.createTextNode(tagname));
      parentElement.appendChild(label);

      pageData.tags.push(tagname);
    }

    // if not contained in tag database, then push to that as well.
  }
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
 * @description Initializes the button and functionality of the editor page.
 *
 * @returns {void} This function does not return a value.
 */
export async function initEditor() {
  const deleteButton = document.querySelector('#delete-button');
  const saveButton = document.querySelector('#save-button');
  const backButton = document.querySelector('#back-button');
  const editButton = document.querySelector('#change-view-button');
  const tagButton = document.querySelector('#tag-button');
  const exportButton = document.querySelector('#export-button');
  const editContent = document.querySelector('#notes-content');

  editContent.addEventListener('click', () => {
    editNote(true);
  });

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

  tagButton.addEventListener('click', () => {
    addTags();
  });

  exportButton.addEventListener('click', () => {
    exportNote();
  });

  if (pageData.editEnabled == null || !pageData.editEnabled) {
    exportButton.classList.add('disabled-button');
    exportButton.disabled = true;
    saveButton.classList.remove('disabled-button');
    saveButton.disabled = false;
  } else {
    exportButton.classList.remove('disabled-button');
    exportButton.disabled = false;
    saveButton.classList.add('disabled-button');
    saveButton.disabled = true;
  }
}
