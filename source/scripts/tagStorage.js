let tagDB;

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
        const tagsDBopenReq = indexedDB.open('tags_DB', 2);
        tagsDBopenReq.onupgradeneeded = (event) => {
          // Set up the database table if it hasn't been initialized yet.
          tagDB = event.target.result;
          const objectStore = tagDB.createObjectStore('tags', {
            keyPath: 'uuid',    
            autoIncrement: true,
          });
        //   objectStore.createIndex('notes', 'notes', { unique: false });
        };
        // adding default tags into the database
        objectStore.add("Work");
        objectStore.add("Projects");
        objectStore.add("Home");
        objectStore.add("Goals");

        tagsDBopenReq.onsuccess = (event) => {
          tagDB = event.target.result;
          resolve(tagDB);
        };
        tagsDBopenReq.onerror = (event) => {
          reject(new Error(`Error opening tag database! ${event.target.errorCode}`));
        };
      });
}

