@IsTest 
class AHMS_NonEndemicAccountController_Test {
    @IsTest
    static void testAccountCreate(){
        Test.startTest();
        final Id accountId = AHMS_NonEndemicAccountController.createAccount(
            String.valueOf(Math.random()).left(10),
            'test'
        );
        Test.stopTest();
        System.assert(String.isNotBlank(accountId), 'Account should be created');
    }
}