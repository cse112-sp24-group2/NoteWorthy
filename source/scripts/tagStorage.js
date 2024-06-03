import{pageData as r}from"./Routing.js";import{OBJECT_STORE_NAME as a}from"./noteStorage.js";let n;const c="tags",s={tag_name:"",num_notes:0};function e(){return new Promise((t,r)=>{var e;n?t(n):((e=indexedDB.open("tags_DB")).onupgradeneeded=e=>{var t=(n=e.target.result).createObjectStore(c,{keyPath:"tag_name",autoIncrement:!0}),r=["work","projects","personal","school"];for(let e=0;e<r.length;e+=1){var o=s;o.tag_name=r[e],t.put(o)}},e.onsuccess=e=>{n=e.target.result,t(n)},e.onerror=e=>{r(new Error("Error opening tag database! "+e.target.errorCode))})})}function t(n){return new Promise((t,r)=>{var e=n.transaction(c).objectStore(c);const o=[];e=e.openCursor();e.onsuccess=e=>{e=e.target.result;e?(o.push(e.value),e.continue()):t(o)},e.onerror=e=>{r(new Error("Error fetching tags from storage: "+e.target.errorCode))}})}function o(o,n){return new Promise((e,t)=>{const r=o.transaction(a).objectStore(a).get(n);r.onsuccess=()=>{e(r.result)},r.onerror=()=>{t(new Error(`Error fetching tag with tagName ${n} from storage.`))}})}function g(a,e){const s=e;return new Promise((e,t)=>{var r,o=a.transaction(c,"readwrite").objectStore(c);let n;(n=s.tag_name?(r=o.get(s.tag_name),s.num_notes=r.num_notes+1,o.put(s)):o.add(s)).onsuccess=()=>{console.log("Successfully saved tag with tag_name "+n.result),e(n.result)},n.onerror=()=>{t(new Error("Error saving new tag to storage"))}})}function u(o,n){return new Promise((e,t)=>{const r=o.transaction(c,"readwrite").objectStore(c).delete(n.tag_name);r.onsuccess=()=>{console.log("Successfully deleted tag with tag_name "+r.result),e()},r.onerror=()=>{t(new Error(`Error deleting tag with tag_name ${n.tag_name} from storage`))}})}function i(e){var t=r.database.transaction("NotesOS").objectStore("NotesOS").index("note_tags");console.log(t.getAll(e))}export{e as initializeTagDB,t as getTagsFromStorage,o as getTagFromStorage,g as saveTagToStorage,u as deleteTagFromStorage,i as tagQuery};