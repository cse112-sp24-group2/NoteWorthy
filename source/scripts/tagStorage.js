/*
 * tagStorage.js provides general tags functionality and tags database management
 *
 * Functions inside this file:
 *   - initializeTagDB()
 *   - getTagsFromStorage()
 *   - saveTagToStorage()
 *   - deleteNoteFromStorage()
 */
import { pageData } from './Routing.js';

let tagDB;
const TAG_STORE_NAME = 'tags';
const TAG_OBJECT = {
  tag_name: '',
  num_notes: 0,
};

/**
 * Adds tags to the DOM.
 *
 * @returns {Promise<Array>} A promise that resolves with an array of all the tags.
 */
export async function addTagsToDOM(tagDBObjectStore, noteObject) {
  const allTagsRequest = tagDBObjectStore.getAllKeys();
  const allTags = [];
  const noteTags = noteObject.tags;
  const allTagsPromise = new Promise((resolve, reject) => {
    allTagsRequest.onsuccess = () => {
      for (let i = 0; i < allTagsRequest.result.length; i += 1) {
        allTags.push(allTagsRequest.result[i]);
      }
      resolve(allTags);
    };
    allTagsRequest.onerror = () => {
      reject(allTagsRequest.error);
    };
  });
  await allTagsPromise;
  const parentElement = document.getElementById('notes-tags');
  parentElement.innerHTML = '';
  for (let i = 0; i < allTags.length; i += 1) {
    const defaultTagObject = TAG_OBJECT;
    defaultTagObject.tag_name = allTags[i];
    // adding the checkboxes and labels for the default tags
    // const parentElement = document.getElementById('notes-tags');
    const newCheckBox = document.createElement('input');
    newCheckBox.type = 'checkbox';
    if (noteTags.includes(allTags[i])) {
      newCheckBox.checked = true;
    } else {
      newCheckBox.checked = false;
    }
    newCheckBox.className = 'tag';
    newCheckBox.name = defaultTagObject.tag_name;

    parentElement.appendChild(newCheckBox);
    // eslint-disable-next-line
    newCheckBox.addEventListener('change', () => {
      const tagsObjectStore = tagDB.transaction('tags').objectStore('tags');
      const tagGetRequest = tagsObjectStore.get(newCheckBox.name);
      tagGetRequest.onsuccess = () => {
        const currentTag = tagGetRequest.result;
        if (newCheckBox.checked === true) {
          currentTag.num_notes += 1;
        } else {
          currentTag.num_notes -= 1;
        }
        const tagPutRequest = tagDB.transaction('tags', 'readwrite').objectStore('tags');
        tagPutRequest.put(currentTag);
      };
    });

    const label = document.createElement('label');
    label.htmlFor = defaultTagObject.tag_name;
    label.appendChild(document.createTextNode(defaultTagObject.tag_name));
    parentElement.appendChild(label);
  }
}

// TODO: WILL NEED THIS DONT DELETE!!!!
// export function addTagsToSidebar(tagDBObjectStore, tagsList) {}

/**
 * Sets up and returns a reference to our IndexedDB tags storage.
 * @returns A reference to our IndexedDB tags storage.
 */
export function initializeTagDB() {
  return new Promise((resolve, reject) => {
    if (tagDB) {
      resolve(tagDB);
      return;
    }
    // creates tag indexDB
    const tagsDBopenReq = indexedDB.open('tags_DB');
    tagsDBopenReq.onupgradeneeded = (event) => {
      // Set up the database table if it hasn't been initialized yet.
      tagDB = event.target.result;
      const objectStore = tagDB.createObjectStore(TAG_STORE_NAME, {
        keyPath: 'tag_name',
        autoIncrement: true,
      });
      const defaultTags = ['work', 'projects', 'personal', 'school'];
      for (let i = 0; i < defaultTags.length; i += 1) {
        const defaultTagObject = TAG_OBJECT;
        defaultTagObject.tag_name = defaultTags[i];
        objectStore.add(defaultTagObject);
      }
    };

    tagsDBopenReq.onsuccess = (event) => {
      tagDB = event.target.result;
      resolve(tagDB);
    };
    tagsDBopenReq.onerror = (event) => {
      reject(new Error(`Error opening tag database! ${event.target.errorCode}`));
    };
  });
}

/**
 * Gets all tags stored in 'tags_DB' from IndexedDB.
 * @param {*} database The initialized indexedDB object
 * @returns A list of tags.
 */
export function getTagsFromStorage(database) {
  return new Promise((resolve, reject) => {
    // not sure what this line does, need to ask about it or research
    const objectStore = database.transaction(TAG_STORE_NAME).objectStore(TAG_STORE_NAME);
    const tags = [];
    const getTagsRequest = objectStore.openCursor();
    getTagsRequest.onsuccess = (event) => {
      // Iterate through all the tags received and add them to be returned.
      const cursor = event.target.result;
      if (cursor) {
        tags.push(cursor.value);
        cursor.continue();
      } else {
        resolve(tags);
      }
    };
    getTagsRequest.onerror = (event) => {
      reject(new Error(`Error fetching tags from storage: ${event.target.errorCode}`));
    };
  });
}

/**
 * Gets a single tag from storage, if it exists.
 * @param {*} database The initialized indexedDB object.
 * @param {*} tagName tagName of the tag.
 * @returns The note object stored with the given UUID.
 */
export async function getTagFromStorage(database, tagName) {
  return new Promise((resolve, reject) => {
    const objectStore = database.transaction(TAG_STORE_NAME).objectStore(TAG_STORE_NAME);
    const getTagRequest = objectStore.get(tagName);
    getTagRequest.onsuccess = () => {
      resolve(getTagRequest.result === 'undefined');
    };
    getTagRequest.onerror = () => {
      reject(new Error(`Error fetching tag with tagName ${tagName} from storage.`));
    };
  });
}

/**
 * Takes the given tag and saves it to the database. To make a new tag,
 * pass in a Tag object where the name is undefined and a new note will be made.
 * @param {*} database The initialized indexedDB object.
 * @param {*} tagObj The tag object to save.
 * @returns Promise<int> The name of the newly saved tag.
 */

export function saveTagToStorage(database, tagObj, newTag) {
  const tag = tagObj;
  if (newTag) {
    return new Promise((resolve, reject) => {
      const objectStore = database.transaction(TAG_STORE_NAME, 'readwrite').objectStore(TAG_STORE_NAME);
      const saveTagRequest = objectStore.add(tag);
      saveTagRequest.onsuccess = () => {
        resolve(saveTagRequest.result);
      };
      saveTagRequest.onerror = () => {
        reject(new Error('Error saving new tag to storage'));
      };
    });
  }
  return new Promise((resolve, reject) => {
    const objectStore = database.transaction(TAG_STORE_NAME, 'readwrite').objectStore(TAG_STORE_NAME);
    const saveTagRequest = objectStore.put(tag);
    saveTagRequest.onsuccess = () => {
      resolve(saveTagRequest.result);
    };
    saveTagRequest.onerror = () => {
      reject(new Error('Error saving new tag to storage'));
    };
  });
}

/**
 * Takes the given note and deletes it from storage.
 * @param {*} database The initialized indexedDB object.
 * @param {*} tag The note object to delete.
 * @returns Promise<void>
 */
export function deleteTagFromStorage(database, tag) {
  return new Promise((resolve, reject) => {
    const objectStore = database.transaction(TAG_STORE_NAME, 'readwrite').objectStore(TAG_STORE_NAME);
    const deleteTagRequest = objectStore.delete(tag.tag_name);
    deleteTagRequest.onsuccess = () => {
      resolve();
    };
    deleteTagRequest.onerror = () => {
      reject(new Error(`Error deleting tag with tag_name ${tag.tag_name} from storage`));
    };
  });
}

/**
 * @description Queries the notes database for notes with a specific tag.
 *
 * @param {string} className - The tag name to query for.
 * @returns {Array<Object>} - An array of note objects with the specified tag.
 */
export function tagQuery() {
  // eslint-disable-next-line
  const notesDB = pageData.database.transaction('NotesOS').objectStore('NotesOS');
  // eslint-disable-next-line
  const tagsIndex = notesDB.index('note_tags');
}
