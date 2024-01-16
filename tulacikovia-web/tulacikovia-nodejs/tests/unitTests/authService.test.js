
const { Authenticator } = require('../../src/bff/authentication/AuthService');

describe('AuthService', () => {
  const authenticator = new Authenticator();
  
  

  /*beforeEach(() => {
    authenticator = new Authenticator();
  });*/

  it('should detect that user exists', async () => {
    console.log("Test start");
    return authenticator.doesUserExists('dominik.kerestes01@gmail.com').then(result => {
      expect(result).toBeTruthy();
    });
  });
/*
  it.concurrent('should NOT detect that user exists', async () => {
    const result = await authenticator.doesUserExists('dominik.kerestes0123@gmail.com');
    //console.log(result);
    expect(result).toBeFalsy();
  });

  it.concurrent('should verify user ', async () => {
    const result = await authenticator.verifyUser('test@mail.com', 'password123');
    expect(result).toBeTruthy();

  });

  it.concurrent('should NOT verify user ', async () => {
    const result = await authenticator.verifyUser('test@mail.com', 'password');
    expect(result).toBeFalsy();
  });*/

  
});
/*
const { Authenticator } = require('../../src/bff/authentication/AuthService');
//const { DBClient } = require('../../src/bff/database/database');
const { MongoClient } = require('mongodb');
const { MongoMemoryServer } = require('mongodb-memory-server');



describe('Authenticator', () => {
    let authenticator;
    let db;
    let connection;
    let mongod;

    beforeAll(async () => {
        mongod = await MongoMemoryServer.create({
          instance: {
            storageEngine: 'wiredTiger',
          },
        });
        const uri = mongod.getUri();
        connection = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        db = connection.db('testDB');
    });

    beforeEach(() => {
        authenticator = new Authenticator();
    });

    afterEach(async () => {
        await db.collection('credentials').deleteMany({});
    });

    afterAll(async () => {
        await connection.close();
        await mongod.stop();
    });

    it('should detect that user exists', () => {
        const email = 'test@example.com';
        db.collection('credentials').insertOne({ email });

        const result = authenticator.doesUserExists(email);

        expect(result).toBe(true);
    });

    it('should NOT detect that user exists', async () => {
        const email = 'nonexistent@example.com';

        const result = await authenticator.doesUserExists(email);

        expect(result).toBe(false);
    });
});


const { Authenticator } = require('../../src/bff/authentication/AuthService');
// Importujeme potrebné veci, napr. DBClient, funkciu doesUserExists a testovaciu knižnicu
//const { doesUserExists } = require('./yourFileWithFunction');
const DBClient = require('../../src/bff/database/database'); // Predpokladáme import DBClient


// Unit test pre funkciu doesUserExists
describe('doesUserExists', () => {
  let connectionMock;
  let collectionMock;

  beforeEach(() => {
    // Simulujeme mock pre connection a collection
    collectionMock = {
      findOne: jest.fn(),
    };

    connectionMock = {
      db: jest.fn().mockReturnThis(),
      collection: jest.fn().mockReturnThis(),
      close: jest.fn(),
    };

    // Mockovanie funkcií z DBClient
    DBClient.connect = jest.fn().mockResolvedValue(connectionMock);
    connectionMock.db.mockReturnThis();
    connectionMock.collection.mockReturnValue(collectionMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  const authenticator = new Authenticator;

  it('should return true if user exists', async () => {
    const email = 'test@example.com';
    const fakeUser = { id: '123',
    email: 'dominik.kerestes01@gmail.com',
    username: 'dominikkerestes',};
    
    collectionMock.findOne.mockResolvedValue(fakeUser);

    const result = await authenticator.doesUserExists(email);

    expect(DBClient.connect).toHaveBeenCalledTimes(1);
    expect(connectionMock.db).toHaveBeenCalledWith(dbName);
    expect(connectionMock.collection).toHaveBeenCalledWith(dbCollection);
    expect(collectionMock.findOne).toHaveBeenCalledWith({ email });
    expect(result).toBe(true);
    expect(connectionMock.close).toHaveBeenCalledTimes(1);
  },50000);

  it('should return false if user does not exist', async () => {
    const email = 'nonexistent@example.com';
    
    collectionMock.findOne.mockResolvedValue(null);

    const result = await doesUserExists(email);

    expect(DBClient.connect).toHaveBeenCalledTimes(1);
    expect(connectionMock.db).toHaveBeenCalledWith(dbName);
    expect(connectionMock.collection).toHaveBeenCalledWith(dbCollection);
    expect(collectionMock.findOne).toHaveBeenCalledWith({ email });
    expect(result).toBe(false);
    expect(connectionMock.close).toHaveBeenCalledTimes(1);
  });

  it('should handle errors appropriately', async () => {
    const email = 'test@example.com';
    const fakeError = new Error('Fake error message');
    
    collectionMock.findOne.mockRejectedValue(fakeError);

    await expect(doesUserExists(email)).rejects.toThrowError(fakeError);

    expect(DBClient.connect).toHaveBeenCalledTimes(1);
    expect(connectionMock.db).toHaveBeenCalledWith(dbName);
    expect(connectionMock.collection).toHaveBeenCalledWith(dbCollection);
    expect(collectionMock.findOne).toHaveBeenCalledWith({ email });
    expect(connectionMock.close).toHaveBeenCalledTimes(1);
  });
});

*/