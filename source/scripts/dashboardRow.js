import { initializeDB, deleteNoteFromStorage, getNotesFromStorage, saveNoteToStorage } from './noteStorage.js';
import { updateURL } from './Routing.js';
import { addNotesToDocument } from './notesDashboard.js';
import { toggleClassToArr } from './utility.js';

const template = document.getElementById('dashboard-note-template');

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

    this.dom.deleteBtn.addEventListener('click', async (event) => {
      event.stopPropagation();
      deleteNote(note);
    });
    this.dom.copyButton.addEventListener('click', async (event) => {
      event.stopPropagation();
      copyNote(note);
    });
    const handleClick = (e) => {
      e.stopPropagation();
      this.flipNote();
    }

    this.dom.backBtn.onclick = handleClick
    this.dom.noteMore.onclick = handleClick
    this.dom.noteFront.onclick = () => updateURL(`?id=${note.uuid}`);
  }

  async deleteNote(note) {
    if (window.confirm('Are you sure you want to delete this note?')) {
      const db = await initializeDB(indexedDB);
      deleteNoteFromStorage(db, note);
      window.location.reload();
    } 
  }

  async copyNote(note) {
      const db = await initializeDB(indexedDB);
      const newNote = { ...note };
      newNote.title = `${note.title} (copy)`;
      newNote.uuid = Date.now();
      newNote.lastModified = new Date().toLocaleString();
      saveNoteToStorage(db, newNote);
      //  Add new Note row without reloading
      const notes = await getNotesFromStorage(db);
      addNotesToDocument(notes);
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
