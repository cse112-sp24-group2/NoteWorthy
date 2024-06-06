# How to Contribute to this project

## Documentation

All documentation generated via JSDocs [here](https://cse110-fa22-group5.github.io/cse110-fa22-group5/jsdocs/index.html).

## Installing necessary dependencies

To install the CI/CD dependencies for this project, run

```
npm install
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

Start the local host on port `5500`
```
npm start
```

On a separate terminal, run the tests:
```
npm run test
```

### To run the lighthouse tests:

```
lhci autorun
```
