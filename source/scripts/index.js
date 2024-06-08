/*
 * index.js is the entry point of the website. It initilizes the database, dashboard, sidebar, and note editor.
 *
 * Functions inside this file:
 *   - switchToDashboard()
 *   - switchToEditor()
 *   - URLRoutingHandler()
 *   - initEventHandler()
 *   - init()
 */
import { pageData, updateURL } from './Routing.js';
import { initializeDB, getNotesFromStorage, getNoteFromStorage } from './noteStorage.js';
import { editNote, addNoteToDocument, initEditor } from './notesEditor.js';
import { initializeTagDB, getTagsFromStorage, addTagsToDOM } from './tagStorage.js';
import { initTagSearch, addTagsToDocument } from './sidebar.js';
import { getDate } from './utility.js';
import { addNotesToDocument, initTimeColumnSorting, initTitleColumnSorting, initSearchBar } from './notesDashboard.js';
import { initSettings } from './settings.js';

/**
 * @description Switches current view to dashboard
 *
 * @param {HTMLElement} dom to hide/unhide dashboard and editor
 * @returns {void} this function does not return a value.
 */
async function switchToDashboard(dom) {
  const db = pageData.database;
  const notes = await getNotesFromStorage(db);
  const noteTagsElement = document.getElementById('notes-tags');
  noteTagsElement.innerHTML = '';
  document.getElementById('tag-input').value = document.getElementById('tag-input').defaultValue;
  addNotesToDocument(notes);
  dom.editor.classList.add('hidden');
  dom.dashboard.classList.remove('hidden');
}

/**
 * @description Switches current view to editor
 *
 * @param {Number} id note id
 * @param {HTMLElement} dom to hide/unhide dashboard and editor
 * @returns {void} This function does not return a value.
 */
async function switchToEditor(id, dom) {
  if (id !== 9999) {
    const db = pageData.database;
    const note = await getNoteFromStorage(db, id);
    pageData.editEnabled = false;
    const tagsObjectStore = await pageData.tagDB.transaction('tags').objectStore('tags');
    await addTagsToDOM(tagsObjectStore, note);
    addNoteToDocument(note);
  } else {
    const noteObject = {
      title: '',
      lastModified: `${getDate()}`,
      tags: [],
      content: '',
    };
    const tagsObjectStore = await pageData.tagDB.transaction('tags').objectStore('tags');
    await addTagsToDOM(tagsObjectStore, noteObject);
    await addNoteToDocument(noteObject);
    editNote(true);
  }
  dom.editor.classList.remove('hidden');
  dom.dashboard.classList.add('hidden');
}

/**
 * @description handles url routing, checks url parameters and loads
 *              dashboard or editor accordingly
 *
 * @returns {void} This function does not return a value.
 */
function URLRoutingHandler() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');

  if (id === '9999' || id == null) {
    pageData.noteID = null;
    pageData.tags = [];
  } else {
    pageData.noteID = parseInt(id, 10);
  }

  // So that child functions can hide/unhide dashboard or editor
  const dom = {
    editor: document.querySelector('.editor'),
    dashboard: document.querySelector('.dashboard'),
  };

  if (id == null) {
    switchToDashboard(dom);
    document.getElementById('tag-input').value = document.getElementById('tag-input').defaultValue;
    // const tags = document.getElementById('notes-tags');
    // tags.remove();
    // document.getElementById('notes-tags').innerHTML = '';
  } else {
    switchToEditor(parseInt(id, 10), dom);
  }
}

function initThemeToggle() {
  const darkModeButton = document.querySelector('#darkMode');
  darkModeButton.addEventListener('click', () => {
    darkModeButton.textContent = document.body.classList.contains('dark') ? 'Light' : 'Dark';
    pageData.theme = pageData.theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', pageData.theme);
  });
}

/**
 * @description Initializes the necessary components for Sidebar and Notes
 *              dashboard
 *
 * @returns {void} This function does not return a value.
 */
async function initEventHandler() {
  const db = pageData.database;
  const notes = await getNotesFromStorage(db);
  // 'the pageData.tags is', pageData.tags);
  addTagsToDocument(pageData.tags);
  initTimeColumnSorting(notes);
  initTitleColumnSorting(notes);
  initSearchBar(notes);
  initTagSearch();
  initThemeToggle();

  document.querySelector('.header > h1').addEventListener('click', async () => updateURL(''));

  let currURL = window.location.search;
  window.addEventListener('popstate', () => {
    const newURL = window.location.search;
    if (newURL !== currURL) {
      currURL = newURL;
      URLRoutingHandler();
    }
  });
}

/**
 * @description Main INIT function. Is called when dom is loaded.
 *              Initializes:
 *                Sidebar
 *                Notes Dashboard
 *                Note Editor
 *                Database ( connects if one is existing )
 
 * @returns {void} This function does not return a value.
 */
async function init() {
  // HACK: need to change and handle proper URL
  document.querySelector('#newNote').addEventListener('click', () => updateURL('?id=9999'));
  pageData.database = await initializeDB(indexedDB);
  pageData.tagDB = await initializeTagDB(indexedDB);
  pageData.tags = await getTagsFromStorage(pageData.tagDB);
  initEventHandler();
  initSettings();
  initEditor();
  URLRoutingHandler();
}

window.addEventListener('DOMContentLoaded', init);
