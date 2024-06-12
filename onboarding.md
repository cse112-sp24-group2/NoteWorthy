# How to Contribute to this project

## Documentation

All documentation generated via JSDocs [here](https://cse112-sp24-group2.github.io/JSDocs/).

## Installing necessary dependencies

To install the CI/CD dependencies for this project, run

```
npm install
```

To install the dependencies for the site, run

```
cd source && npm install
```

## Running the site Locally
This will host the site on `localhost:5173`

```
cd source && npm run dev
```

## Building the production version of the site
We use vite to bundle all of our files to make them smaller and allow npm packages to be used, therefore 
viewing the final product will include building/bundling everything together before deploying. This will
display the same code as the deployed version of the site.

This will host the site on `localhost:4173`

```
cd source && npm run build
```
To preview the deployed version.
```
cd source && npm run preview
```

## Linting and Validation

Validate our CSS, HTML, and Javascript files with linting and validation tools listed here.

We use [ESLint](https://eslint.org/) and [Prettier](https://prettier.io/) to automatically check and fix code formatting and quality.

To check and automatically fix code for linting and formatting, run

```
npm run lint:fix
```

To only check the code for linting and formatting errors, run

```
npm run lint:check
```

Finally, we validate our HTML using [HTML5 Validator](https://github.com/marketplace/actions/html5-validator) in our CI/CD pipeline.

## Testing

List how to test our code (unit and E2E) and what we use to test.

We use [Jest](https://jestjs.io/) for our backend unit testing (tests located in [./__test__](./__test__/)).

Additionally, we use [Puppeteer](https://pptr.dev/) for end-to-end testing (tests located in [./puppeteerTesting](./puppeteerTesting/))

Lastly, we use [Google's Lighthouse](https://developer.chrome.com/docs/lighthouse/overview) to test the performance of our frontend. This is done entirely through the command line with a configuration file at [./lighthouserc.js](./lighthouserc.js).

### To run unit and end-to-end tests:

Start the local host on port `5173`
```
cd source && npm run dev
```

On a separate terminal, run the tests from the root directory:
```
npm run test
```

### To run the lighthouse tests:

```
lhci autorun
```
