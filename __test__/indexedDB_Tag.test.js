import { indexedDB } from 'fake-indexeddb';
import {
  initializeTagDB,
  getTagsFromStorage,
  getTagFromStorage,
  saveTagToStorage
} from '../source/scripts/tagStorage.js';

let tagDB;

describe('Backend: Read/Add tags', () => {
    beforeAll(async () => {
      tagDB = await initializeTagDB(indexedDB);
    });
  
    it('getTagsFromStorage: No tags initially in storage', async () => {
      const tags = await getTagsFromStorage(tagDB);
      expect(tags).toEqual([]);
    });
  
    it('saveTagToStorage: Successfully save a tag', async () => {
      const tag = {
        tag_name : "work",
        num_notes : 0
      };
      const tag_name = await saveTagToStorage(tagDB, tag);
      expect(tag_name).toEqual("work");
    });
  
    it('getTagFromStorage: Retrieve tag', async () => {
      const tag = await getTagFromStorage(tagDB, "work");
      expect(tag).toEqual({
        tag_name : "work",
        num_notes : 0
      });
    });
  
    it('saveTagToStorage: Multiple tags are saved', async () => {
        const tag = {
            tag_name : "projects",
            num_notes : 0
        };

      const tag_name = await saveTagToStorage(tagDB, tag);
      const tags = await getTagsFromStorage(tagDB);
      expect(tags.length).toBe(2);
    });
  
    it('saveTagToStorage: Update previously stored tag', async () => {
      const tag = {
        tag_name : "projects",
        num_notes : 1
    };
      await saveTagToStorage(tagDB, tag);
      const response = await getNoteFromStorage(tagDB, "projects");
      expect(response).toEqual(tag);
    });
  
    it('getTagFromStorage: Returns undefined when no tag is found', async () => {
      const response = await getNoteFromStorage(tagDB, "tag100");
      expect(response).toEqual(undefined);  
    });
  });