import { initializeDB, getNotesFromStorage, saveNoteToStorage } from './noteStorage.js';
import { deleteNote } from './noteFunctions.js';
import { pageData, updateURL } from './Routing.js';
import { addNotesToDocument } from './notesDashboard.js';
import { toggleClassToArr } from './utility.js';

const template = document.getElementById('dashboard-note-template');

async function copyNote(note) {
  const db = await initializeDB(indexedDB);
  const newNote = { ...note };
  newNote.title = `${note.title} (copy)`;
  newNote.uuid = Date.now();
  newNote.lastModified = new Date().toLocaleString();

  const database = pageData.database;
  const objectStore = database.transaction('NotesOS', 'readwrite').objectStore('NotesOS');
  const getNoteRequest = objectStore.get(note.uuid);
  getNoteRequest.onsuccess = () => {
    const noteObject = getNoteRequest.result;
    const tags = noteObject.tags;
    const tagDB = pageData.tagDB;
    const tagsObjectStore = tagDB.transaction('tags').objectStore('tags');
    for (let i = 0; i < tags.length; i += 1) {
      const tagGetRequest = tagsObjectStore.get(tags[i]);
      tagGetRequest.onsuccess = () => {
        const tag = tagGetRequest.result;
        tag.num_notes += 1;
        const tagPutRequest = tagDB.transaction('tags', 'readwrite').objectStore('tags');
        tagPutRequest.put(tag);
      };
    }
  };
  saveNoteToStorage(db, newNote);
  //  Add new Note row without reloading
  const notes = await getNotesFromStorage(db);
  addNotesToDocument(notes);
  updateURL(`?id=${newNote.uuid}`);
}

class dashboardRow extends HTMLElement {
  /**
   * create the shadow dom for the dashboard row
   */
  constructor() {
    super();
    this.flipped = false;
    this.animation = false;

    const shadow = this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    this.dom = this.fetchElementsFromDOM();

    const note = document.createElement('div');
    note.setAttribute('class', 'note');
    shadow.append(note);
  }

  /**
   * Finds necessary HTML elements in shadow root and puts into this.dom object
   * @param none
   */
  fetchElementsFromDOM() {
    return {
      noteWrapper: this.shadowRoot.querySelector('.note-wrapper'),
      noteFront: this.shadowRoot.querySelector('.note-front'),
      noteBack: this.shadowRoot.querySelector('.note-back'),
      title: this.shadowRoot.querySelector('.note-title'),
      content: this.shadowRoot.querySelector('.note-text'),
      copyButton: this.shadowRoot.querySelector('.note-copy-button'),
      lastModified: this.shadowRoot.querySelector('.note-last-modified'),
      noteMore: this.shadowRoot.querySelector('.note-more'),
      downloadBtn: this.shadowRoot.querySelector('.note-download-button'),
      copyBtn: this.shadowRoot.querySelector('.note-copy-button'),
      deleteBtn: this.shadowRoot.querySelector('.note-delete-button'),
      backBtn: this.shadowRoot.querySelector('.note-back-button'),
      tags: this.shadowRoot.querySelector('.note-tags'),
    };
  }

  /**
   * Set the note property
   * set Delete Button: Delete current note. Need second confirmation
   * set duplicate Button: Duplicate the selected note
   * @param {Object} note containing the note data
   */
  set note(note) {
    const newTitle = document.createTextNode(note.title);
    const newModified = document.createTextNode(note.lastModified);
    const noteContent = note.htmlContent;

    this.dom.title.replaceChildren(newTitle);
    this.dom.lastModified.replaceChildren(newModified);
    this.dom.content.innerHTML = noteContent;
    // add tags to note back
    this.dom.tags.innerHTML = note.tags.map((tag) => `<span class="tag">${tag}</span>`).join('');

    this.dom.deleteBtn.addEventListener('click', async (event) => {
      event.stopPropagation();
      deleteNote(note.uuid);
    });
    this.dom.copyButton.addEventListener('click', async (event) => {
      event.stopPropagation();
      copyNote(note);
    });
    const handleClick = (e) => {
      e.stopPropagation();
      this.flipNote();
    };

    this.dom.backBtn.onclick = handleClick;
    this.dom.noteMore.onclick = handleClick;
    this.dom.noteFront.onclick = () => updateURL(`?id=${note.uuid}`);
  }

  flipNote() {
    if (!this.animation) {
      // fires once per element for lifetime
      toggleClassToArr([this.dom.noteFront, this.dom.noteBack], 'transition-action');
      this.animation = true;
    }

    toggleClassToArr([this.dom.noteFront, this.dom.noteBack], 'flipped');
    this.flipped = !this.flipped;
  }
}

customElements.define('dashboard-row', dashboardRow);
