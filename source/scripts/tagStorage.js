/*
 * tagStorage.js provides general tags functionality and tags database management
 *
 * Functions inside this file:
 *   - initializeTagDB()
 *   - getTagsFromStorage()
 *   - saveTagToStorage()
 *   - deleteNoteFromStorage()
 */
let tagDB;
const TAG_STORE_NAME = 'tags';
const TAG_OBJECT = {
  tag_name: '',
  num_notes: 0,
};

/**
 * @description Retrieves the number of notes associated with a specific tag from the IndexedDB.
 *
 * @param {IDBDatabase} tagDb - The IndexedDB database containing the tags object store.
 * @param {string} tagName - The name of the tag to retrieve the number of notes for.
 * @returns {Promise<number>} A promise that resolves with the number of notes associated with the tag.
 */
export function getTagNumNotes(tagDb, tagName) {
  const tagsObjectStore = tagDb.transaction('tags').objectStore('tags');
  const tagGetRequest = tagsObjectStore.get(tagName);

  return new Promise((resolve, reject) => {
    tagGetRequest.onsuccess = () => {
      resolve(tagGetRequest.result.num_notes);
    };
    tagGetRequest.onerror = () => {
      reject(tagGetRequest.error);
    };
  });
}

/**
 * @description Updates the number of notes associated with a specific tag in the IndexedDB.
 *
 * @param {IDBDatabase} tagDb - The IndexedDB database containing the tags object store.
 * @param {string} tagName - The name of the tag to update the number of notes for.
 * @param {boolean} isChecked - A boolean indicating whether to increment or decrement the number of notes.
 * @returns {void} This function does not return a value.
 */
export function updateTagNumNotes(tagDb, tagName, isChecked) {
  const tagsObjectStore = tagDb.transaction('tags').objectStore('tags');
  const tagGetRequest = tagsObjectStore.get(tagName);
  tagGetRequest.onsuccess = () => {
    const currentTag = tagGetRequest.result;
    if (isChecked) {
      currentTag.num_notes += 1;
    } else {
      currentTag.num_notes -= 1;
    }
    const tagPutRequest = tagDB.transaction('tags', 'readwrite').objectStore('tags');
    tagPutRequest.put(currentTag);
  };
}

/**
 * @description Adds tags to the Document Object Model (DOM) based on data retrieved from the IndexedDB.
 *
 * @param {IDBObjectStore} tagDBObjectStore - The IndexedDB object store containing tags.
 * @param {Object} noteObject - The note object containing tags associated with the note.
 * @param {Array<string>} noteObject.tags - An array of tags associated with the note.
 * @returns {Promise<void>} A promise that resolves once tags are added to the DOM.
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
    const defaultTagObject = { ...TAG_OBJECT }; // Create a new object to avoid mutating the original
    defaultTagObject.tag_name = allTags[i];

    // Create the checkbox input
    const newCheckBox = document.createElement('input');
    newCheckBox.type = 'checkbox';
    newCheckBox.className = 'editor-tag-checkbox';
    newCheckBox.id = `tag-${defaultTagObject.tag_name}`; // Unique ID for each checkbox
    newCheckBox.name = defaultTagObject.tag_name;
    newCheckBox.checked = noteTags.includes(allTags[i]);

    // Add event listener to the checkbox
    // eslint-disable-next-line
    newCheckBox.addEventListener('change', () => {
      updateTagNumNotes(tagDB, newCheckBox.name, newCheckBox.checked);
    });

    // Create the label (acting as container)
    const label = document.createElement('label');
    label.htmlFor = newCheckBox.id; // Associate label with checkbox using 'for' attribute
    label.className = 'editor-tag-label';

    // Create a span for the tag name
    const tagNameSpan = document.createElement('span');
    tagNameSpan.className = 'editor-tag-name';
    tagNameSpan.textContent = defaultTagObject.tag_name;

    // Assemble the elements
    label.appendChild(newCheckBox);
    label.appendChild(tagNameSpan);
    parentElement.appendChild(label);
  }
}

/**
 * Sets up and returns a reference to our IndexedDB tags storage.
 * @returns A reference to our IndexedDB tags storage.
 */
export function initializeTagDB(indexedDB) {  
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
 * @description Saves a tag to the IndexedDB storage.
 *
 * @param {IDBDatabase} database - The IndexedDB database.
 * @param {Object} tagObj - The tag object to be saved.
 * @param {boolean} newTag - A boolean indicating whether the tag is new or existing.
 * @returns {Promise<IDBValidKey>} A promise that resolves with the key of the saved tag.
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
