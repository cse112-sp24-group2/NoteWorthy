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
    const style = document.createElement('style');
    style.textContent = `.note {
                display: flex;
                flex-direction: row;
                font-family: sans-serif;
                justify-content: space-between;
                // width: 100%;
                margin: 1px;
                padding: 10px 30px 10px 30px;
                background: #9867C5;
            }

            .note > div {
                display: flex;
            }

            .deleteButton {
                display: none;
                margin-right: 1.5em;
            }

            .note > p, .lastModified {
                color: white;
                font-family: 'Poppins', sans-serif;
            }

            .note:hover {
                filter: drop-shadow(0px 0px 10px black);
                outline: 1px black;
                cursor: pointer;
            }

           .note:hover div > button {
                display:block;
                background: url('../source/images/trash-can-solid.svg');
                cursor: pointer;
                height: 1.7em;
                width: 1.5em;
            }

            .note:hover div > button:hover {
                filter: drop-shadow(0px 0px 5px white);
            }

            .note > div > button {
                border-style: none;
                margin-top: 2.3ex;
            }
        `;

    shadow.append(style);
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
   * set Delete Button: Delete current note. Need second confirmation
   * set duplicate Button: Duplicate the selected note
   * @param {Object} note containing the note data
   */
  set note(note) {
     const newTitle = document.createTextNode(note.title);
    const newModified = document.createTextNode(note.lastModified);

    this.dom.title.replaceChildren(newTitle);
    this.dom.lastModified.replaceChildren(newModified);

    noteDiv.innerHTML = `
            <p class="title">${note.title}</p>
            <div>
                <button class="deleteButton"></button>
                <p class="lastModified">${note.lastModified}</p>
            </div>
        `;
    const button = shadow.querySelector('.note > div > button');
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
}

customElements.define('dashboard-row', dashboardRow);
