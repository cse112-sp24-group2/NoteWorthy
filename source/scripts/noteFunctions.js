import{pageData as a,updateURL as r}from"./Routing.js";import{deleteNoteFromStorage as n,getNoteFromStorage as s,getNotesFromStorage as i}from"./noteStorage.js";import{addNotesToDocument as d}from"./notesDashboard.js";import{confirmDialog as m}from"./settings.js";async function t(t){var t=t||a.noteID,e=a.database,e=await s(e,t),t=new Blob([e.content],{type:"text/plain"}),t=URL.createObjectURL(t),o=document.createElement("a");o.href=t,o.download=e.title+".txt",document.body.appendChild(o),o.click(),document.body.removeChild(o),URL.revokeObjectURL(t)}async function e(t){var e=t||a.noteID,o=a.database;e&&await m("Are you sure you want to delete this note?")&&(n(o,{uuid:e}),t?(e=await i(o),d(e)):r(""))}export{t as exportNote,e as deleteNote};