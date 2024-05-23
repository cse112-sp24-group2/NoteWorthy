import { getDate, generateRandomString } from "../source/scripts/utility.js"

describe('getDate' , () => {
  it('should return string', () => {
    const date = getDate();
    expect(typeof date).toBe('string')
  })
})

describe('generateRandomString', () => {
  it('should return type string', () => {
    const str = generateRandomString(10);
    expect(typeof str).toBe('string');
  })

  it('should return string of length 10', () => {
    const str = generateRandomString(10);
    expect(str.length).toBe(10);
  })
})


