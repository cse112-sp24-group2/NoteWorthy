import markdown from './markdown.js';

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
