public without sharing class AHMS_NonEndemicAccountController {
    
    @AuraEnabled
    public static Id createAccount(String name, String description) {
        try {
            final Account newAccount = new Account(
                RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByDeveloperName()
                .get(AHMS_Accounts.RECORDTYPE_DEVNAME_NON_ENDEMIC).getRecordTypeId(),
                Name = name,
                Description = description
            );
            insert newAccount;
            return newAccount.Id;
        } catch(Exception e) {
            throw AHMS_ExceptionHandling.lightningException(e.getMessage());
        }
    }
}