import { initializeDB, deleteNoteFromStorage } from './noteStorage.js';
import updateURL from './index.js';

const template = document.getElementById('dashboard-note-template');

class dashboardRow extends HTMLElement {
  /**
   * create the shadow dom for the dashboard row
   */
  constructor() {
    super();
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
      deleteButton: this.shadowRoot.querySelector('.note-delete-button'),
      lastModified: this.shadowRoot.querySelector('.note-last-modified'),
    };
  }

  /**
   * Set the note property
   * @param {Object} note containing the note data
   */
  set note(note) {
    const newTitle = document.createTextNode(note.title);
    const newModified = document.createTextNode(note.lastModified);

    this.dom.title.replaceChildren(newTitle);
    this.dom.lastModified.replaceChildren(newModified);

    this.dom.deleteButton.addEventListener('click', async (event) => {
      event.stopPropagation();
      // confirm note deletion with user
      if (window.confirm('Are you sure you want to delete this note?')) {
        const db = await initializeDB(indexedDB);
        deleteNoteFromStorage(db, note);
        window.location.reload();
      } else {
        // do nothing if user does not confirm deletion
      }
    });

    this.dom.noteFront.onclick = () => {
      updateURL(`?id=${note.uuid}`);
    };
  }
}

customElements.define('dashboard-row', dashboardRow);
