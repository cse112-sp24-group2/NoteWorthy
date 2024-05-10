let tagDB;
const TAG_STORE_NAME = 'tags';
// const initialTags = [{ 1: "work" }, { 2: "projects" }, { 3: "personal" }];

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
        keyPath: 'id',
        autoIncrement: true,
      });
      const initialTags = [{ 1: "work" }, { 2: "projects" }, { 3: "personal" }];
      for (var i = 0; i < initialTags.length; i++) {
        objectStore.put(initialTags[i]);
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
    const objectStore = database
      .transaction(TAG_STORE_NAME)
      .objectStore(TAG_STORE_NAME);
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
      reject(
        new Error(
          `Error fetching tags from storage: ${event.target.errorCode}`
        )
      );
    };
  });
}
