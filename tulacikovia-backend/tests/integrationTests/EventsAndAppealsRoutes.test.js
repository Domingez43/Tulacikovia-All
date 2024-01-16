const request = require('supertest');
const express = require('express');
const app = express();
const router = require('../../src/eventsAndAppeals/EventAndAppealRoutes');
const {Authenticator} = require('../../src/authentication/AuthService');
const {EventsAndAppealsManager} = require('../../src/eventsAndAppeals/EventsAndAppealsManager');
const {  PlatformUser, UserProfile, OrganizationProfile } = require('../../src/models/UserModel');
const {DBClient} = require('../../src/database/database');
const { ObjectId } = require('mongodb');

const organization = new OrganizationProfile("test@example.com", new Date(), new Date(), undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined);
const user = new UserProfile("test@example.com", new Date(), new Date(), undefined , "TestSurname", "TestPicture", undefined , "TestLocale", "TestToken", "TestAccesToken", "TestRefreshToken");


var verifyAccessTokenMock = jest
  .spyOn(Authenticator, 'verifyAccessToken')
  .mockImplementation( () => {
    return { userProfile: organization};
  });

var isActiveEventOrAppealWithSameNameMock = jest
  .spyOn(EventsAndAppealsManager.prototype, 'isActiveEventOrAppealWithSameName')
  .mockImplementation( () => {
    return false;
  });

var atributesVerificationMock = jest
  .spyOn(EventsAndAppealsManager.prototype, 'atributesVerification')
  .mockImplementation( () => {
    return false;
  });

var createAppealMock = jest
  .spyOn(EventsAndAppealsManager.prototype, 'createAppeal')
  .mockImplementation( () => {
    console.log('createAppealMock function');
  });

var getOrganizatorMock = jest
  .spyOn(EventsAndAppealsManager.prototype, 'getOrganizator')
  .mockImplementation( () => {
    console.log('getOrganizatorMock function');
    return 'test@example.com';
  });

var editEventOrAppealMock = jest
  .spyOn(EventsAndAppealsManager.prototype, 'editEventOrAppeal')
  .mockImplementation( () => {
    console.log('editEventOrAppealMock function');
  });

var processWithGeneralTypeMock = jest
  .spyOn(EventsAndAppealsManager.prototype, 'processWithGeneralType')
  .mockImplementation( () => {
    console.log('processWithGeneralTypeMock function');
    return 123;
  });




describe('Create event or appeal endpoint tests', () => {

    const testAppeal = {
      name: 'TestName',
      type: 'APPEAL',
      tag: 'TestTag',
      description: 'TestDescription',
      picture: 'TestPicture',
      location: 'TestLocation',
      startDate: new Date(),
      endDate: new Date(),
    };

    beforeAll(() => {
        app.use(express.json());
        app.use('/', router); 

    });
 
    it('should create appeal/event', async () => {
    
      const response = await request(app).post('/createEventOrAppeal').set({Authorization: 'Test Token'}).send(testAppeal);
      
      expect(verifyAccessTokenMock.mock.calls.length).toBe(1)
      expect(isActiveEventOrAppealWithSameNameMock.mock.calls.length).toBe(1)
      expect(isActiveEventOrAppealWithSameNameMock.mock.calls[0][0]).toBe(testAppeal.name)
      expect(atributesVerificationMock.mock.calls.length).toBe(1)
      expect(createAppealMock.mock.calls.length).toBe(1)
      expect(createAppealMock.mock.calls[0][0]).toBe(organization.email)
      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Appeal created successfully');
    }, 6000);

    it('should NOT create appeal/event - same name', async () => {
      isActiveEventOrAppealWithSameNameMock.mockReset();
      isActiveEventOrAppealWithSameNameMock = jest
      .spyOn(EventsAndAppealsManager.prototype, 'isActiveEventOrAppealWithSameName')
      .mockImplementation( () => {
        return true;
      });
 
      const response = await request(app).post('/createEventOrAppeal').set({Authorization: 'Test Token'}).send(testAppeal);
      
      expect(verifyAccessTokenMock.mock.calls.length).toBe(2)
      expect(isActiveEventOrAppealWithSameNameMock.mock.calls.length).toBe(1)
      expect(isActiveEventOrAppealWithSameNameMock.mock.calls[0][0]).toBe(testAppeal.name)
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Appeal with same name already exists');
    }, 6000);

    it('should NOT create appeal/event - bad author type', async () => {
      verifyAccessTokenMock.mockReset();
      verifyAccessTokenMock = jest
      .spyOn(Authenticator, 'verifyAccessToken')
      .mockImplementation( () => {
        return { userProfile: user};
      });
 
      const response = await request(app).post('/createEventOrAppeal').set({Authorization: 'Test Token'}).send(testAppeal);
      
      expect(verifyAccessTokenMock.mock.calls.length).toBe(1)
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('You are not allowed to create Appeal');
    }, 6000);
});



describe('Edit event or appeal endpoint tests', () => {

  const testAppeal = {
    id: '123',
    status: 'Active',
    name: 'TestName',
    type: 'APPEAL',
    tag: 'TestTag',
    description: 'TestDescription',
    picture: 'TestPicture',
    location: 'TestLocation',
    startDate: new Date(),
  };

  beforeAll(() => {
      app.use(express.json());
      app.use('/', router); 

  });

  it('should edit appeal/event', async () => {
    verifyAccessTokenMock.mockReset();
    verifyAccessTokenMock = jest
      .spyOn(Authenticator, 'verifyAccessToken')
      .mockImplementation( () => {
        return { userProfile: organization};
      });
    
    const id = 123;
    const response = await request(app).post('/editEventOrAppeal/${id}').set({Authorization: 'Test Token'}).send(testAppeal);
    
    expect(verifyAccessTokenMock.mock.calls.length).toBe(1)
    expect(getOrganizatorMock.mock.calls.length).toBe(1)
    expect(editEventOrAppealMock.mock.calls.length).toBe(1)
    expect(editEventOrAppealMock.mock.calls[0][0]).toBe(testAppeal.id)
    expect(response.status).toBe(202);
    expect(response.body.message).toBe('Post successfully edited.');
  }, 6000);

  it('should NOT edit appeal/event - bad editor', async () => {
    getOrganizatorMock.mockReset();
    getOrganizatorMock = jest
    .spyOn(EventsAndAppealsManager.prototype, 'getOrganizator')
    .mockImplementation( () => {
      console.log('getOrganizatorMock function');
      return 'bad@example.com';
    });
    
    const id = 123;
    const response = await request(app).post('/editEventOrAppeal/${id}').set({Authorization: 'Test Token'}).send(testAppeal);
    
    expect(verifyAccessTokenMock.mock.calls.length).toBe(2)
    expect(getOrganizatorMock.mock.calls.length).toBe(1)
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Your are not alowed to edit this post.');
  }, 6000);
});


describe('Content create appeal endpoint tests', () => {

  const testAppeal = {
    id: '123',
    status: 'Active',
    name: 'TestName',
    type: 'APPEAL',
    tag: 'TestTag',
    description: 'TestDescription',
    picture: 'TestPicture',
    location: 'TestLocation',
    startDate: new Date(),
  };

  beforeAll(() => {
      app.use(express.json());
      app.use('/', router); 

  });

  it('should create appeal/event', async () => {
    const id = 123;
    const response = await request(app).post('/content/create/appeal').set({Authorization: 'Test Token'}).send(testAppeal);
    
    expect(verifyAccessTokenMock.mock.calls.length).toBe(3)
    expect(processWithGeneralTypeMock.mock.calls.length).toBe(1)
    expect(response.status).toBe(200);
    expect(response.body.state).toBe('inserted');
  }, 6000);

  it('should NOT create appeal/event - bad type', async () => {
    processWithGeneralTypeMock.mockReset();
    processWithGeneralTypeMock = jest
    .spyOn(EventsAndAppealsManager.prototype, 'processWithGeneralType')
    .mockImplementation( () => {
      throw new Error('Unable to identify content type parsed from input object, insert denied.');
    });

    const id = 123;
    const response = await request(app).post('/content/create/appeal').set({Authorization: 'Test Token'}).send(testAppeal);
    
    expect(verifyAccessTokenMock.mock.calls.length).toBe(4)
    expect(processWithGeneralTypeMock.mock.calls.length).toBe(1)
    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Unable to identify content type parsed from input object, insert denied.');
  }, 6000);

});

describe('Content update appeal endpoint tests', () => {

  const testAppeal = {
    id: '123',
    status: 'Active',
    name: 'TestName',
    type: 'APPEAL',
    tag: 'TestTag',
    description: 'TestDescription',
    picture: 'TestPicture',
    location: 'TestLocation',
    startDate: new Date(),
  };

  beforeAll(() => {
      app.use(express.json());
      app.use('/', router); 

  });

  it('should update appeal/event', async () => {
    processWithGeneralTypeMock.mockReset();
    processWithGeneralTypeMock = jest
    .spyOn(EventsAndAppealsManager.prototype, 'processWithGeneralType')
    .mockImplementation( () => {
      console.log('processWithGeneralTypeMock function');
      return 123;
    });

    const id = 123;
    const response = await request(app).post('/content/update/appeal').set({Authorization: 'Test Token'}).send(testAppeal);
    
    expect(verifyAccessTokenMock.mock.calls.length).toBe(5)
    expect(processWithGeneralTypeMock.mock.calls.length).toBe(1)
    expect(response.status).toBe(200);
    expect(response.body.state).toBe('inserted');
  }, 6000);

  it('should NOT update appeal/event', async () => {
    processWithGeneralTypeMock.mockReset();
    processWithGeneralTypeMock = jest
    .spyOn(EventsAndAppealsManager.prototype, 'processWithGeneralType')
    .mockImplementation( () => {
      throw new Error('Unable to identify content type parsed from input object, insert denied.');
    });

    const id = 123;
    const response = await request(app).post('/content/update/appeal').set({Authorization: 'Test Token'}).send(testAppeal);
    
    expect(verifyAccessTokenMock.mock.calls.length).toBe(6)
    expect(processWithGeneralTypeMock.mock.calls.length).toBe(1)
    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Unable to identify content type parsed from input object, insert denied.');
  }, 6000);


});