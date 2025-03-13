@IsTest
class AHMS_LookupController_Test {
    @TestSetup
    static void testSetup(){
        AHMS_TestFactory.createAdvertiser('TestAdvertiser');
    }

    @IsTest
    static void search_Positive(){
        AHMS_LookupController.Configuration config = new AHMS_LookupController.Configuration();
        config.sObjectType = 'Account';
        config.sObjectField = 'Name';
        System.debug(config);
        Test.startTest();
        final List<SObject> results = AHMS_LookupController.search('Test', JSON.serialize(config));
        Test.stopTest();
        System.assertEquals(true, !results.isEmpty(), 'There should be records returned by the function');
    }

    @IsTest
    static void search_Negative(){
        AHMS_LookupController.Configuration config = new AHMS_LookupController.Configuration();
        config.sObjectType = 'Account';
        config.sObjectField = 'Name';
        System.debug(config);
        Test.startTest();
        final List<SObject> results = AHMS_LookupController.search('WrongTerm', JSON.serialize(config));
        Test.stopTest();
        System.assertEquals(true, results.isEmpty(), 'There should be no records returned by the function');
    }

    @IsTest
    static void search_WrongInput(){
        AHMS_LookupController.Configuration config = new AHMS_LookupController.Configuration();
        config.sObjectType = 'Account';
        config.sObjectField = 'FakeField';
        String error = '';
        Test.startTest();
        try {
            final List<SObject> results = AHMS_LookupController.search('WrongTerm', JSON.serialize(config));
        } catch (Exception e){
            error = e.getMessage();
        }
        Test.stopTest();
        System.assertEquals(true, String.isNotBlank(error), 'There should be an error thrown');
    }
}