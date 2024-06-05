# CI / CD Pipeline
- Using GitHub Actions
- Triggered by changes to `main` branch
----
![CICD drawio](https://github.com/cse112-sp24-group2/NoteWorthy/assets/92479171/93d7bf98-af76-43b5-904e-8d97e7b2d832)
----

### Code Quality
- CodeClimate is used to measure code quality. Scores are visible in project README.md

#### Testing
Tests defined in `__tests__` folder as `*.test.js` for end to end a unit tests
- Jest for a unit testing
- Puppeteer for end to end testing
- Google Lighthouse for performance, accessibility, SEO, best practices testing

#### Linting
- Using ESLINT + Prettier
- Using AirBnB guidelines
- HTML Validation

#### Documentation
- Using JSDocs
- Documentation pushed to `jsdocs/` folder in the form of `.html` files

#### Minification
- Continues only if all three of the previous steps succeeded, i.e.
    * All unit tests passed
    * All style guidelines passed
    * HTML validation passes
- Javascript is minifed using UglifyJS
- Extra files are skinned from the repo and everything is placed into a new branch `gh-pages`

#### Final Deployment
- `gh-pages` is deployed to GitHub Pages


