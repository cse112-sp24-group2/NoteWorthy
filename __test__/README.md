## Testing

List how to test our code (unit and E2E) and what we use to test.

We use [Jest](https://jestjs.io/) for our backend unit testing (tests located in [./__test__](./__test__/)).

Additionally, we use [Puppeteer](https://pptr.dev/) for end-to-end testing (tests located in [./puppeteerTesting](./puppeteerTesting/))

To run unit and end-to-end tests:

Start the local host on port `5500`
```
npm start
```

On a separate terminal, run the tests
```
npm run test
```
