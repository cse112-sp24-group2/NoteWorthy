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
import { initializeTagDB, getTagsFromStorage } from './tagStorage.js';
import { initTagSearch, addTagsToDocument } from './sidebar.js';
import { getDate } from './utility.js';
import {
  addNotesToDocument,
  hideEmptyWojak,
  initTimeColumnSorting,
  initTitleColumnSorting,
  initSearchBar,
} from './notesDashboard.js';

/**
 * @description Switches current view to dashboard
 *
 * @param {HTMLElement} dom to hide/unhide dashboard and editor
 * @returns {void} this function does not return a value.
 */
async function switchToDashboard(dom) {
  const db = pageData.database;
  const notes = await getNotesFromStorage(db);
  addNotesToDocument(notes);
  dom.editor.classList.add('hidden');
  dom.dashboard.classList.remove('hidden');
  hideEmptyWojak(notes.length !== 0);
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
    addNoteToDocument(note);
  } else {
    const noteObject = {
      title: '',
      lastModified: `${getDate()}`,
      tags: [],
      content: '',
    };
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
    // pageData.tags =
  }

  // So that child functions can hide/unhide dashboard or editor
  const dom = {
    editor: document.querySelector('.editor'),
    dashboard: document.querySelector('.dashboard'),
  };

  if (id == null) {
    switchToDashboard(dom);
    // const tags = document.getElementById('notes-tags');
    // tags.remove();
    // document.getElementById('notes-tags').innerHTML = '';
  } else {
    switchToEditor(parseInt(id, 10), dom);
  }
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

  const darkModeButton = document.querySelector('#darkMode');
  function updateButtonText() {
    darkModeButton.textContent = document.body.classList.contains('dark') ? 'Light' : 'Dark';
  }

  darkModeButton.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    updateButtonText();

    const sidebar = document.querySelector('.sidebar');
    const tagsHeader = document.querySelector('#tags');
    const viewMore = document.querySelector('#view-more');
    const dashboardHeader = document.querySelector('.dashboard-header');
    const sort = document.querySelector('#sort');
    const searchBarWrapper = document.querySelector('.searchbar-wrapper');
    const emptyDashboard = document.querySelector('.empty-dashboard');
    const view = document.querySelector('.view');
    const editor = document.querySelector('.editor');
    const notesTitle = document.querySelector('#notes-title');
    const titleInput = document.querySelector('#title-input');
    const noteControlBar = document.querySelector('.note-control-bar');

    sidebar.classList.toggle('dark');
    tagsHeader.classList.toggle('dark');
    viewMore.classList.toggle('dark');
    dashboardHeader.classList.toggle('dark');
    sort.classList.toggle('dark');
    searchBarWrapper.classList.toggle('dark');
    emptyDashboard.classList.toggle('dark');
    view.classList.toggle('dark');
    editor.classList.toggle('dark');
    notesTitle.classList.toggle('dark');
    titleInput.classList.toggle('dark');
    noteControlBar.classList.toggle('dark');
  });

  const button = document.querySelector('#newNote');
  button.addEventListener('click', async () => {
    // HACK: need to change and handle proper URL
    updateURL('?id=9999');
  });
  const h1 = document.querySelector('.header > h1');
  h1.addEventListener('click', async () => {
    updateURL('');
  });

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
  const button = document.querySelector('#newNote');
  button.addEventListener('click', () => {
    // HACK: need to change and handle proper URL
    updateURL('?id=9999');
  });

  // console.log(performance.now())
  // console.log('%cWelcome to %cNoteWorthy. ', '', 'color: #D4C1EC; font-weight: bolder; font-size: 0.8rem', '');
  pageData.database = await initializeDB(indexedDB);
  pageData.tagDB = await initializeTagDB(indexedDB);
  pageData.tags = await getTagsFromStorage(pageData.tagDB);
  // console.log(performance.now())
  initEventHandler();
  initEditor();
  URLRoutingHandler();
}

window.addEventListener('DOMContentLoaded', init);
