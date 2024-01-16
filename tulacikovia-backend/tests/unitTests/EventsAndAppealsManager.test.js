
const { EventsAndAppealsManager } = require('../../src/eventsAndAppeals/EventsAndAppealsManager');


describe('EventsAndAppealsManager', () => {
  let eventsAndAppealsManager;

  beforeEach(() => {
    eventsAndAppealsManager = new EventsAndAppealsManager();
  }); 

  it('should verify editor correctly', () => {
    const result = eventsAndAppealsManager.verifyEditor('TestOrganization', 'TestOrganization');
    expect(result).toBeTruthy();
  });

  it('should NOT verify editor correctly', () => {
    const result = eventsAndAppealsManager.verifyEditor('TestOrganization', 'TestUser');
    expect(result).toBeFalsy();
  });

  it('should NOT verify editor correctly', () => {
    const result = eventsAndAppealsManager.verifyEditor(null, null);
    expect(result).toBeFalsy();
  });

  it('should verify atributes correctly', () => {
    const result = eventsAndAppealsManager.atributesVerification('APPEAL', 'TestDescription', 'TestPicture', 'TestLocation', new Date(), new Date());
    expect(result).toBeTruthy();
  });

  it('should verify atributes correctly', () => {
    const result = eventsAndAppealsManager.atributesVerification('EVENT', 'TestDescription', 'TestPicture', 'TestLocation', new Date(), new Date());
    expect(result).toBeTruthy();
  });
  
  const startDate = 5;
  const endDate = 10;

  it('should NOT verify atributes correctly', () => {
    const result = eventsAndAppealsManager.atributesVerification('EVENT', 'TestDescription', 'TestPicture', 'TestLocation', endDate, startDate);
    expect(result).toBeFalsy();
  });


});