let tagDB;
const TAG_STORE_NAME = 'tags';
const TAG_OBJECT = {
  tag_name: '',
  assoc_notes: 0,
};

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
        objectStore.put(defaultTagObject);
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
 * Takes the given tag and saves it to the database. To make a new tag,
 * pass in a Tag object where the ID is undefined and a new note will be made.
 * @param {*} database The initialized indexedDB object.
 * @param {*} tag The tag object to save.
 * @returns Promise<int> The ID of the newly saved tag.
 */
export function saveTagToStorage(database, tag) {
  if (!tag.id) {
    return new Promise((resolve, reject) => {
      const objectStore = database.transaction(TAG_STORE_NAME, 'readwrite').objectStore(TAG_STORE_NAME);
      const saveTagRequest = objectStore.add(note);
      saveTagRequest.onsuccess = () => {
        console.log(`Successfully saved tag with id ${saveTagRequest.result}`);
        console.log(saveTagRequest.result);
        resolve(saveTagRequest.result);
      };
      saveTagRequest.onerror = () => {
        reject(new Error('Error saving new tag to storage'));
      };
    });
  }
  return new Promise((resolve, reject) => {
    const objectStore = database.transaction(TAG_STORE_NAME, 'readwrite').objectStore(TAG_STORE_NAME);
    const saveTagRequest = objectStore.put(note);
    saveTagRequest.onsuccess = () => {
      console.log(`Successfully saved note with uuid ${saveTagRequest.result}`);
      resolve(saveTagRequest.result);
    };
    saveTagRequest.onerror = () => {
      reject(new Error(`Error saving note with id ${tag.id} to storage`));
    };
  });
}

/**
 * Takes the given note and deletes it from storage.
 * @param {*} database The initialized indexedDB object.
 * @param {*} tag The note object to delete.
 * @returns Promise<void>
 */
export function deleteNoteFromStorage(database, tag) {
  return new Promise((resolve, reject) => {
    const objectStore = database.transaction(TAG_STORE_NAME, 'readwrite').objectStore(TAG_STORE_NAME);
    const deleteTagRequest = objectStore.delete(tag.id);
    deleteTagRequest.onsuccess = () => {
      console.log(`Successfully deleted tag with id ${deleteTagRequest.result}`);
      resolve();
    };
    deleteTagRequest.onerror = () => {
      reject(new Error(`Error deleting tag with id ${tag.id} from storage`));
    };
  });
}
