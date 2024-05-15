import { initializeDB, deleteNoteFromStorage, saveNoteToStorage } from './noteStorage.js';

class dashboardRow extends HTMLElement {
  /**
   * create the shadow dom for the dashboard row
   */
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
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
            .duplicateButton {
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

           .note:hover div > .deleteButton {
                display:block;
                background: url('../source/images/trash-can-solid.svg');
                cursor: pointer;
                height: 1.7em;
                width: 1.5em;
            }
            .note:hover div > .duplicateButton {
                display:block;
                background: url('../source/images/duplicate.svg');
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
   * Set the note property
   * set Delete Button: Delete current note. Need second confirmation
   * set duplicate Button: Duplicate the selected note
   * @param {Object} note containing the note data
   */
  set note(note) {
    const shadow = this.shadowRoot;
    const noteDiv = shadow.querySelector('.note');
    noteDiv.innerHTML = `
            <p class="title">${note.title}</p>
            <div>
                <button class="duplicateButton"></button>
                <button class="deleteButton"></button>
                <p class="lastModified">${note.lastModified}</p>
            </div>
        `;
    const deleteButton = shadow.querySelector('.note > div > .deleteButton');
    deleteButton.addEventListener('click', async (event) => {
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
    //new Note has the same note content/title
    //assign current Time to uuid/lastModified
    const duplicateButton = shadow.querySelector('.note > div > .duplicateButton');
    duplicateButton.addEventListener('click', async (event) => {
      event.stopPropagation();
      const db = await initializeDB(indexedDB);
      const newNote = { ...note };
      newNote.title = `${note.title} (copy)`;
      newNote.uuid = Date.now();
      newNote.lastModified = new Date().toLocaleString();
      saveNoteToStorage(db, newNote);
      window.location.reload();
    });
    noteDiv.onclick = () => {
      window.location.href = `./notes.html?id=${note.uuid}`;
    };
  }
}

customElements.define('dashboard-row', dashboardRow);
