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
import { saveTagToStorage} from './tagStorage.js'

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
    tag.checked = true;
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
  const tagButton = document.querySelector('#tag-button');
  const tagInput = document.querySelector('#tag-input');
  pageData.editEnabled = bool || !pageData.editEnabled; // Toggles the value
  const edit = pageData.editEnabled;

  if (edit) {
    editButton.firstChild.src = './images/edit-note.svg';
    exportButton.classList.add('disabled-button');
    exportButton.disabled = true;
    saveButton.classList.remove('disabled-button');
    saveButton.disabled = false;
    tagButton.classList.remove('disabled-button');
    tagButton.disabled = false;
    tagInput.classList.remove('disabled-button');
    tagInput.disabled = false;
  } else {
    editButton.firstChild.src = './images/preview-note.svg';
    exportButton.classList.remove('disabled-button');
    exportButton.disabled = false;
    saveButton.classList.add('disabled-button');
    saveButton.disabled = true;
    // Disable tag button after clicking save
    tagButton.classList.add('disabled-button');
    tagButton.disabled = true;
    // Disable tag input after clicking save
    tagInput.classList.add('disabled-button');
    tagInput.disabled = true;
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
  const tagDB = pageData.tagDB;
  const tags = [];
  // if(id) {
  //   // const note = getNoteFromStorage(id);
  //   // console.log(note);
  //   // const existingTags = note.tags;
  //   // console.log(existingTags);
  //   // tags = existingTags.concat(pageData.tags); 
  //   tags = pageData.tags;
  // }
  // if(!id) {
  //   tags = pageData.tags;
  // }

  var elements = document.getElementById("notes-tags").elements;

  for (var i = 0, element; element = elements[i++];) {
      if (element.type === "checkbox" && element.checked === true)
        tags.push(element.name);
  }

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
    tags,
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

  const tagList = document.querySelectorAll('#tag');
  for (let i = 0; i < tagList.length; i += 1) {
    tagList[i].classList.add('disabled-button');
    tagList[i].disabled = true;
  }

  for(let i = 0; i < tags.length; i++) {
    const TAG_OBJECT = {
      tag_name : tags[i],
      num_notes : 1,
    };
    saveTagToStorage(tagDB, TAG_OBJECT);
  }
  //  // adding tags to the databases
  // // instead of using pageData.tagDB, could just grab this list from actual index
      // so like objectStore.get(tagname)
  //  }
}

/**
 * @description Adds a Tag to note in the Editor page
 *
 * @returns {void} This function does not return a value.
 */
function addTags() {
  const id = pageData.noteID;
  const db = pageData.database;
  // const db = pageData.database;
  const tagname = document.querySelector('#tag-input').value.replace(/\s+/g, ' ').trim();
  if (tagname === '') {
    alert('Please enter a valid tag name');
  } else {
    // if existing note
    if (id) {
      // console.log()
      // access note
      const note = getNoteFromStorage(id);
      const tags = note.tags;
      // check to see if note is already tagged
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
