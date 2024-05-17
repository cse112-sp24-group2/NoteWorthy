# How to Contribute to this project

## Documentation

All documentation generated via JSDocs [here](https://cse110-fa22-group5.github.io/cse110-fa22-group5/jsdocs/index.html).

## Running and Scripts

To install the CI/CD dependencies for this project, run

```
npm install
```

To run unit and end-to-end tests, run

```
npm run test
```

To check code for linting and formatting using ESLint and Prettier, run

```
npm run lint:fix
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
