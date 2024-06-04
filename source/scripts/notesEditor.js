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
import { getTagFromStorage, getTagsFromStorage, saveTagToStorage } from './tagStorage.js';

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
  title.innerHTML = `<input type="text" ${title.classList.contains('dark') ? 'class="dark"' : 'class=""'} id="title-input" placeholder="Untitled Note">`;
  const titleInput = document.querySelector('#title-input');
  titleInput.value = note.title;
  lastModified.innerHTML = `Last Modified: ${note.lastModified}`;
  quill.setContents(note.content);

  const tagInput = document.querySelector('#tag-input');
  tagInput.setAttribute('placeholder', 'Add tag...');

  // append the tags
  // TODO: add all tags from the database, only checking it off it its in "tags"
  const tags = note.tags;
  const allTags = getTagsFromStorage(pageData.tagDB);
  for (let i = 0; i < allTags.length; i += 1) {
    const tagCheckbox = document.createElement('input');
    console.log(allTags[i]);
    tagCheckbox.type = 'checkbox';
    tagCheckbox.className = 'tag';
    tagCheckbox.name = allTags[i];
    if(tags.includes(allTags[i])) {
      tagCheckbox.checked = true;
    }
    else {
      tagCheckbox.checked = false;
    }
    intPutArea.appendChild(tagCheckbox);
    const label = document.createElement('label');
    label.htmlFor = allTags[i]; // replace with unique tag identifier
    label.appendChild(document.createTextNode(allTags[i]));
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
  pageData.editEnabled = bool || !pageData.editEnabled; // Toggles the value
  const edit = pageData.editEnabled;

  if (edit) {
    exportButton.classList.add('disabled-button');
    exportButton.disabled = true;
    importButton.classList.add('disabled-button');
    importButton.disabled = true;
    saveButton.classList.remove('disabled-button');
    saveButton.disabled = false;
    tagButton.classList.remove('disabled-button');
    tagButton.disabled = false;
    tagInput.classList.remove('disabled-button');
    tagInput.disabled = false;
    tagCheckBoxes.forEach((tag) => {
      tag.classList.remove('disabled-button');
      tag.setAttribute('disabled', false);
    });
  } else {
    exportButton.classList.remove('disabled-button');
    exportButton.disabled = false;
    importButton.classList.remove('disabled-button');
    importButton.disabled = false;
    saveButton.classList.add('disabled-button');
    saveButton.disabled = false;
    // Disable tag button after clicking save
    tagButton.classList.add('disabled-button');
    tagButton.disabled = false;
    // Disable tag input after clicking save
    tagInput.classList.add('disabled-button');
    tagInput.disabled = false;
    tagCheckBoxes.forEach((tag) => {
      tag.classList.add('disabled-button');
      // tag.setAttribute('disabled', true);
    });
  }
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
 * @description Saves the note content and updates the URL with the new note ID.
 *
 * @returns {void} This function does not return a value.
 */
export function saveNote() {
  const db = pageData.database;
  const id = pageData.noteID;
  const tagDB = pageData.tagDB;
  const tags = [];

  const elements = document.getElementById('notes-tags').elements;
  for (let i = 0; i < elements.length; i += 1) {
    const currElement = elements[i];
    if (currElement.type === 'checkbox' && currElement.checked === true) {
      console.log(currElement.name);
      tags.push(currElement.name);
    }
  }

  const title = document.querySelector('#title-input').value.replace(/\s+/g, ' ').trim();
  if (title === '') {
    alert('Please enter a valid title.');
    return;
  }
  const content = quill.getContents();
  const htmlContent = quill.getSemanticHTML();
  const lastModified = getDate();
  // TODO: Need to add tags
  const noteObject = {
    title,
    lastModified,
    tags,
    content,
    htmlContent,
  };
  noteObject.tags = tags;
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
    tagList[i].disabled = false;
  }

  // for (let i = 0; i < tags.length; i += 1) {
  //   const TAG_OBJECT = {
  //     tag_name: tags[i],
  //     num_notes: 1,
  //   };
  //   saveTagToStorage(tagDB, TAG_OBJECT);
  // }
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
async function addTags() {
  // const id = pageData.noteID;
  // const db = pageData.database;
  const tagDB = pageData.tagDB;
  const tagname = document.querySelector('#tag-input').value.replace(/\s+/g, ' ').trim();
  if (tagname === '') {
    alert('Please enter a valid tag name');
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
      newCheckBox.addEventListener('change', function() {
        if (newCheckBox.checked === true) {
          saveTagToStorage(tagDB, TAG_OBJECT, false, true);
        } else {
          saveTagToStorage(tagDB, TAG_OBJECT, false, false);
        }
      });      // newCheckBox.setAttribute('disabled', true);
      parentElement.appendChild(newCheckBox);
      const label = document.createElement('label');
      label.htmlFor = tagname;
      label.appendChild(document.createTextNode(tagname));
      parentElement.appendChild(label);

      // add to the storage.
    const TAG_OBJECT = {
      tag_name: tagname,
      num_notes: 1,
    };
    // get Tag from storage. see if its new or not.
    const tagExists = await getTagFromStorage(tagDB, tagname); // fill in, make this function work pre
    
    // maybe wrong value from tagExists
    console.log("tagExists is returning the value " + tagExists);
    saveTagToStorage(tagDB, TAG_OBJECT, tagExists, true);
    }
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
  saveButton.addEventListener('click', () => saveNote());
  backButton.addEventListener('click', () => updateURL(''));
  tagButton.addEventListener('click', () => addTags());
  exportButton.addEventListener('click', () => exportNote());
  importButton.addEventListener('click', () => importNote());

  // not sure how the logic works here. so here, the saveNote button and its corresponding logic is already established
  // can i check for new checkboxes here?

  if (pageData.editEnabled == null || !pageData.editEnabled) {
    exportButton.classList.add('disabled-button');

    exportButton.disabled = true;
    importButton.classList.add('disabled-button');
    importButton.disabled = true;
    saveButton.classList.remove('disabled-button');
    saveButton.disabled = false;
  } else {
    exportButton.classList.remove('disabled-button');
    exportButton.disabled = false;
    importButton.classList.remove('disabled-button');
    importButton.disabled = false;
    saveButton.classList.add('disabled-button');
    saveButton.disabled = false;
  }
}
