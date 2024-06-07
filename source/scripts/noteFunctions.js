/*
 * noteFunctions.js provides note related functions that need to be called from
 * both the editor AND the dashboard. Other note related functions are defined within
 * noteDashboard.js or dashboardRow.js
 *
 * Functions inside this file:
 *   - exportNote()
 *   - deleteNote()
 */
import { pageData, updateURL } from './Routing.js';
import { deleteNoteFromStorage, getNoteFromStorage, getNotesFromStorage } from './noteStorage.js';
import { addNotesToDocument } from './notesDashboard.js';
import { confirmDialog } from './settings.js';

/**
 * @description Exports the note as a txt file
 *
 * @returns {void} This function does not return a value.
 */
export async function exportNote() {
  const id = pageData.noteID;
  const db = pageData.database;
  const note = await getNoteFromStorage(db, id);
  // eslint-disable-next-line
  const doc = new jsPDF();
  doc.text(note.content.ops[0].insert, 10, 20);
  doc.save(`${note.title}.pdf`);
}

/**
 * @description Deletes the note
 *
 * @param {Number} toDelete OPTIONAL. Do not pass a ID if you are currently
 *                  in the editor page, ID will be handled automatically. Only pass ID
 *                  when deleting note from dashboard
 * @returns {void} This function does not return a value.
 */
export async function deleteNote(toDelete) {
  const id = toDelete || pageData.noteID;
  const db = pageData.database;

  console.log(id);

  if (!id) return;

  const confirm = await confirmDialog('Are you sure you want to delete this note?');
  if (!confirm) return;

  deleteNoteFromStorage(db, { uuid: id });

  // different actions depending on deleting from dashboard or
  // editor
  if (toDelete) {
    const notes = await getNotesFromStorage(db);
    addNotesToDocument(notes);
  } else {
    updateURL('');
  }
}
