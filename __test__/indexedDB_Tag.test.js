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

  it('getTagsFromStorage: Default tags initially in storage', async () => {
    const tags = await getTagsFromStorage(tagDB);
    const personalTag = {
      "num_notes": 0,
      "tag_name": "personal",
    }
    const projectsTag = {
      "num_notes": 0,
      "tag_name": "projects",
    }

    const schoolTag = {
      "num_notes": 0,
      "tag_name": "school",
    }
    const workTag = {
      "num_notes": 0,
      "tag_name": "work",
    }
    expect(tags).toEqual([personalTag, projectsTag, schoolTag, workTag]);
  });

  it('saveTagToStorage: Successfully save a tag', async () => {
    const tag = {
      tag_name: "tag1",
      num_notes: 0
    };
    const tag_name = await saveTagToStorage(tagDB, tag);
    expect(tag_name).toEqual("tag1");
  });

  it('saveTagToStorage: Multiple tags are saved', async () => {
    const tag = {
      tag_name: "random",
      num_notes: 0
    };

    const tag_name = await saveTagToStorage(tagDB, tag);
    const tags = await getTagsFromStorage(tagDB);
    expect(tags.length).toBe(6);
  });

  it('saveTagToStorage: Update previously stored tag', async () => {
    const tag = {
      tag_name: "projects",
      num_notes: 1
    };
    const response = await saveTagToStorage(tagDB, tag);
    expect(response).toEqual("projects");
  });

  it('getTagFromStorage: Returns false when no tag is found', async () => {
    const response = await getTagFromStorage(tagDB, "tag100");
    expect(response).toEqual(false);
  });
});