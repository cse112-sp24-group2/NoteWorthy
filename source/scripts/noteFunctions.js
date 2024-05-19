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
import { deleteNoteFromStorage, getNoteFromStorage } from './noteStorage.js';

/**
 * @description Exports the note as a txt file
 *
 * @param {string} OPTIONAL uuid (called from individual note cards)
 * @returns {void} This function does not return a value.
 */
export async function exportNote(uuid) {
  const id = uuid || pageData.noteID;
  const db = pageData.database;
  const note = await getNoteFromStorage(db, id);
  const blob = new Blob([note.content], { type: 'text/plain' });
  const href = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = href;
  link.download = `${note.title}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(href);
}

/**
 * @description Deletes the note
 *
 * @param {Number} toDelete OPTIONAL. Do not pass a ID if you are currently
 *                  in the editor page, ID will be handled automatically. Only pass ID
 *                  when deleting note from dashboard
 * @returns {void} This function does not return a value.
 */
export function deleteNote(toDelete) {
  const id = toDelete || pageData.noteID;
  const db = pageData.database;

  if (!id) return;
  if (!window.confirm('Are you sure you want to delete')) return;

  deleteNoteFromStorage(db, { uuid: id });

  // This means we are deleting from the editor page, so we should return
  // to the dashboard
  if (!toDelete) updateURL('');
}
