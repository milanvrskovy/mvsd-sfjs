@IsTest 
class AHMS_LightningUtil_Test {
    public static final String 
        ACCOUNT_NAME = 'TestAccount_AHMS_MultivalueFieldDisplayCont_Test',
        EXCEPTION_ASSERTION_MESSAGE = 'There should be an exception thrown',
        GETTER_SUCCESS_ASSERTION_MESSAGE = 'Method should retrieve the correct field value',
        SETTER_SUCCESS_ASSERTION_MESSAGE = 'Method should update the field value';

    @TestSetup
    static void testSetup(){
        insert new Account(Name = ACCOUNT_NAME);
    }
    
    @IsTest
    static void getRecord_Success(){
        final Id accountId = [SELECT Id FROM Account LIMIT 1].Id;
        Test.startTest();
        final String record = (String)((SObject)JSON.deserialize(
            AHMS_LightningUtil.getRecord(new List<String>{'Name'}, accountId), 
            SObject.class)
        ).get('Name');
        Test.stopTest();
        System.assertEquals(ACCOUNT_NAME, Record, GETTER_SUCCESS_ASSERTION_MESSAGE);
    }

    @IsTest
    static void getRecord_Exception(){
        Test.startTest();
        String error = '';
        try{
            AHMS_LightningUtil.getRecord(new List<String>{'Name'}, 'abc');
        } catch (Exception e){
            error = e.getMessage();
        }
        Test.stopTest();
        System.assert(String.isNotBlank(error), EXCEPTION_ASSERTION_MESSAGE);
    }

    @IsTest
    static void updateRecord_Success(){
        final Id accountId = [SELECT Id FROM Account LIMIT 1].Id;
        final String newValue = 'TestValue';
        Test.startTest();
        AHMS_LightningUtil.updateRecord(JSON.serialize(new Account(
            Id = accountId,
            Description = newValue
        )));
        Test.stopTest();
        System.assertEquals(newValue, [SELECT Id, Description FROM Account WHERE Id = :accountId].Description, SETTER_SUCCESS_ASSERTION_MESSAGE);
    }

    @IsTest
    static void updateRecord_Exception(){
        final Id accountId = [SELECT Id FROM Account LIMIT 1].Id;
        Test.startTest();
        String error = '';
        try {
            AHMS_LightningUtil.updateRecord('{Id:"' + accountId + '", NumberOfEmployees:"abc"}');
        } catch (Exception e) {
            error = e.getMessage();
        }
        Test.stopTest();
        System.assert(String.isNotBlank(error), EXCEPTION_ASSERTION_MESSAGE);
    }

    @IsTest
    static void getPicklistValues(){
        Test.startTest();
        final List<String> picklistValues = AHMS_LightningUtil.getPicklistValues('ADvendio__Campaign_Item__c', 'Zone__c');
        Test.stopTest();
        System.assert(!picklistValues.isEmpty(), GETTER_SUCCESS_ASSERTION_MESSAGE);
    }
}