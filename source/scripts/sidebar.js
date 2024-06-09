/*
 * sidebar.js initializes the provides sidebar functionality
 *
 * Functions inside this file:
 *   - addTagsToDocument()
 *   - initTagSearch()
 */
import { tagQuery, getTagsFromStorage } from './tagStorage.js';
import { getNotesFromStorage } from './noteStorage.js';
import { addNotesToDocument } from './notesDashboard.js';
import { pageData } from './Routing.js';

/**
 * @description Return the notes that match the query string. Case insensitive.
 *
 * @param {Array<Object>} notes Array containing all the notes in local storage
 * @param {String} query The search string to filter the notes on
 * @returns {Array<Object>} Filtered notes array
 */
function filterNotesByTags(notes, tags) {
  // If tags is empty or undefined, return all notes
  if (!tags || tags.length === 0) return notes;

  // Filter notes that have at least one tag from the tags array
  return notes.filter((note) => note.tags.some((tag) => tags.includes(tag)));
}

function createTagHTML(name, count) {
  const template = document.getElementById('sidebar-tag-template');
  const tagEl = template.content.cloneNode(true);

  const tagInput = tagEl.querySelector('.tags-input');
  tagInput.id = `tag-${name}`;
  tagInput.name = name;

  const tagName = tagEl.querySelector('.tags-name');
  tagName.textContent = name;

  const tagCount = tagEl.querySelector('.tags-count');
  tagCount.textContent = count || 0;

  const tagLabel = tagEl.querySelector('.tags-label');
  tagLabel.htmlFor = `tag-${name}`;
  return tagEl;
}

async function searchByTag() {
  const tagListEl = document.querySelector('.tags-list');
  const checkedTags = [];

  // Find all checked checkboxes within .tags-list
  const checkedCheckboxes = tagListEl.querySelectorAll('.tags-input:checked');

  // Extract tag names from the checked checkboxes
  checkedCheckboxes.forEach((checkbox) => {
    const tagName = checkbox.name;
    if (tagName) {
      checkedTags.push(tagName);
    }
  });

  const notes = await getNotesFromStorage(pageData.database);
  addNotesToDocument(filterNotesByTags(notes, checkedTags));
}

export async function addTagsToSidebar() {
  pageData.tags = await getTagsFromStorage(pageData.tagDB);
  console.log(pageData.tags);

  // Sort tags by num_notes in descending order
  pageData.tags.sort((a, b) => b.num_notes - a.num_notes);

  const tagListEl = document.querySelector('.tags-list');
  tagListEl.innerHTML = '';

  pageData.tags.forEach((tag) => {
    const tagElement = createTagHTML(tag.tag_name, tag.num_notes);
    const checkbox = tagElement.querySelector('.tags-input');
    checkbox.addEventListener('change', () => {
      if (pageData.page === 'editor') return;
      searchByTag();
    });
    tagListEl.appendChild(tagElement);
  });
}

/**
 * @description Adds tags as radio buttons and labels to a tags list element in the document.
 *
 * @param {Object[]} tags - An array of tag objects containing tag names.
 * @returns {void} this function does not return a value.
 */
export function addTagsToDocument(tags) {
  const tagList = document.querySelector('.tags-list');
  tags.forEach((tag) => {
    const tagButton = document.createElement('input');
    tagButton.classList.add('tags-input');
    tagButton.type = 'checkbox';
    tagButton.id = `tag-${tag.tag_name}`;
    tagButton.name = tag.tag_name;

    const tagSpan = document.createElement('span');
    tagSpan.innerText = tag.tag_name;
    tagSpan.classList.add('tags-span');

    const tagLabel = document.createElement('label');
    tagLabel.htmlFor = `tag-${tag.tag_name}`;
    tagLabel.classList.add('tags-label');
    tagLabel.appendChild(tagButton);
    tagLabel.appendChild(tagSpan);
    tagList.appendChild(tagLabel);
  });
}

/**
 * Initializes the tag search functionality.
 */
export function initTagSearch() {
  const searchButtons = document.getElementsByName('tag-search');
  searchButtons.forEach((button) => {
    button.addEventListener('click', () => {
      tagQuery(button.className);
    });
  });
}
