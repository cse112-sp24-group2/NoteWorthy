/*
 * sidebar.js initializes the provides sidebar functionality
 *
 * Functions inside this file:
 *   - addTagsToDocument()
 *   - initTagSearch()
 */
import { tagQuery } from './tagStorage.js';

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
