/*
 * sidebar.js initializes the provides sidebar functionality
 *
 * Functions inside this file:
 *   - addTagsToDocument()
 *   - initTagSearch()
 */
import { tagQuery } from './noteStorage.js';

/**
 * @description Adds tags as radio buttons and labels to a tags list element in the document.
 *
 * @param {Object[]} tags - An array of tag objects containing tag names.
 * @returns {void} this function does not return a value.
 */
export function addTagsToDocument(tags) {
  const tagList = document.querySelector('.tags-list');
  console.log(tags);
  tags.forEach((tag) => {
    const tagButton = document.createElement('input');
    tagButton.textContent = tag.tag_name;
    tagButton.classList.add(tag.tag_name);
    tagButton.type = 'radio';
    tagButton.name = 'tag-search';
    tagList.appendChild(tagButton);
    const tagLabel = document.createElement('label');
    tagLabel.htmlFor = tag.tag_name;
    tagLabel.textContent = tag.tag_name;
    tagList.appendChild(tagLabel);
  });
  const removeTagButton = document.createElement('button');
  removeTagButton.textContent = 'uncheck all';
  removeTagButton.type = 'uncheck';
  removeTagButton.onclick = () => {
    const tagButtons = document.getElementsByName('tag-search');
    tagButtons.forEach((tagButton) => {
      tagButton.checked = false; // eslint-disable-line no-param-reassign
    });
  };
  tagList.appendChild(removeTagButton);
}

/**
 * Initializes the tag search functionality.
 */
export function initTagSearch() {
  const searchButtons = document.getElementsByName('tag-search');
  console.log(searchButtons);
  searchButtons.forEach((button) => {
    button.addEventListener('click', () => {
      console.log(button.className);
      tagQuery(button.className);
    });
  });
}
