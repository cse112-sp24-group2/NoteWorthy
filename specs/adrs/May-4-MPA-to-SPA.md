# Migrating from Multi-page application to Single-page application

## Motivation
The existing note taking application was built as a Multiple Page Application (MPA), resulting in a clunky user experience and slower performance. To enhance the user experience and improve overall application performance, we decided to migrate to a Single Page Application (SPA) architecture.

## Architectural Designs
- Vanilla HTML, CSS, and JavaScript: Instead of using a modern JavaScript framework, we opted to implement the SPA using plain HTML, CSS, and JavaScript. This approach avoids the overhead of learning and integrating a new framework, and we can port a lot of the features that are already existing.
- Client-side Routing: We implemented client-side routing using JavaScript to handle navigation within the application without triggering full page refreshes, resulting in a smoother user experience.

## Benefits
By migrating to an SPA architecture and adopting the architectural decisions outlined above, we expect to achieve the following benefits:

- Improved user experience with smoother navigation and reduced page refreshes.
- Enhanced performance through efficient rendering and optimized API interactions.
- Better maintainability and scalability of the codebase due to the modular nature of the implementation.
