# Keeping client-side Database instead of migrating to server-side Database

Date: May 17 2024

## Context

Currently, our note-taking application stores everything on indexedDB, a client-side database. 
However, we've been considering the option of migrating to a server-side database to improve data synchronization and enable better collaboration features
along with note sharing.

## Decision

After careful consideration, we have decided to keep the client-side database for our note-taking application.

## Reasons

- Time and Complexity: Implementing a server-side database solution would be more time-consuming and add significant complexity to the project. 
Given our limited time and resources, we prefer to focus on delivering other more interesting and valuable features for our users.

- Data Privacy: Storing data locally on the client-side eliminates the need to transmit sensitive note data to a server,
potentially reducing privacy concerns for users.

- Simplicity: Keeping the client-side database approach simplifies the overall architecture and reduces the complexity of
managing a server-side database and related infrastructure.

- Premature Scaling: We want to be able to develop a product that users can enjoy without the industry standard features of note sharing or synchronization,
and once we achieve user acceptance, we will add a server-side database.


