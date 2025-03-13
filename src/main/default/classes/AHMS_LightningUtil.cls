public with sharing class AHMS_LightningUtil {

    public static final String QUERY_TEMPLATE = 'SELECT Id, {0} FROM {1} WHERE Id = \'\'{2}\'\' LIMIT 1';
    
    @AuraEnabled(cacheable=true)
    public static List<String> getPicklistValues(String objectName, String fieldName) {
        List<String> picklistValues = new List<String>();
        try {
            for (Schema.PicklistEntry picklistEntry : Schema.getGlobalDescribe().get(objectName)
            .getDescribe().fields.getMap().get(fieldName).getDescribe().getPicklistValues()) {
                picklistValues.add(picklistEntry.getLabel());
            }
        } catch (Exception e) {
            //throw AHMS_ExceptionHandling.lightningException(e.getMessage());
        }
        return picklistValues;
    }
    
    @AuraEnabled(cacheable=true)
    public static String getRecord(List<String> fieldNames, Id recordId) {
        try {
            return JSON.serialize(Database.query(String.format(QUERY_TEMPLATE, new List<String>{
                String.join(fieldNames, ','),
                recordId.getSObjectType().getDescribe().getName(),
                recordId   
            }))[0]);
        } catch (Exception e){
            //throw AHMS_ExceptionHandling.lightningException(e.getMessage());
        }
    }

    @AuraEnabled
    public static void updateRecord(String recordJSON) {
        final SObject record = (SObject)JSON.deserialize(recordJSON, SObject.class);
        final SObjectType objectType = ((Id)record.get('Id')).getSObjectType();
        for (String fieldName: record.getPopulatedFieldsAsMap().keySet()){
            if (fieldName != 'Id' && !objectType.getDescribe().fields.getMap().get(fieldName).getDescribe().isUpdateable()) {
                throw new SecurityException('Insufficient permissions to update field value');
            }
        }
        try {
            update record;
        } catch (DmlException e) {
            //throw AHMS_ExceptionHandling.lightningException(e.getDmlMessage(0));
        } catch (Exception e) {
            //throw AHMS_ExceptionHandling.lightningException(e.getMessage());
        } 
    }
}