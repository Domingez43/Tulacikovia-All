/*const chai = require('chai');
const expect = chai.expect;*/

const { CredentialsValidation } = require('../../src/bff/authentication/CredentialsValidation.ts');

describe('CredentialsValidation', () => {
  let credentialsValidation;

  beforeEach(() => {
    credentialsValidation = new CredentialsValidation();
  });

  it('should validate email correctly', () => {
    const result = credentialsValidation.validateEmail('test@example.com');
    expect(result.error).toBeUndefined();
  });

  it('should NOT validate email correctly', () => {
    const result = credentialsValidation.validateEmail('testexample.com');
    expect(result.error).toBeDefined();
  });

  it('should validate password correctly', () => {
    const result = credentialsValidation.validatePassword('12345678');
    expect(result.error).toBeUndefined();
  });

  it('should NOT validate password correctly', () => {
    const result = credentialsValidation.validatePassword('1234567');
    expect(result.error).toBeDefined();
  });

  it('should validate password match correctly', () => {
    const result = credentialsValidation.validatePasswordMatch('password123', 'password123');
    expect(result.error).toBeUndefined();
  });

  it('should NOT validate password match correctly', () => {
    const result = credentialsValidation.validatePasswordMatch('password123', 'password456');
    expect(result.error).toBeDefined();
  });

  it('should validate credentials correctly', () => {
    const result = credentialsValidation.validateCredentials('test@example.com', 'password123', 'password123');
    expect(result).toBeFalsy();
  });

  it('should NOT validate credentials correctly', () => {
    const result = credentialsValidation.validateCredentials('test@example.com', '', '');
    expect(result).toBeTruthy();
  });
});