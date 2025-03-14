/* Description: Controller for the "Lookup" generic lightning web component
*  Author:      Milan
*  TestClass:   AHMS_LookupController_Test
*/
public with sharing class AHMS_LookupController {
    public class DevelopmentException extends Exception{}

    public static final String QUERY_FORMAT = 'SELECT Id, {0} FROM {1} WHERE {2} ORDER BY {3} LIMIT {4}';

    @AuraEnabled
    public static List<SObject> search(String searchTerm, String configurationInput){
        try {
            final Configuration configuration = (Configuration)JSON.deserialize(configurationInput, Configuration.class);
            return sortResults(Database.query(configuration.generateQuery(searchTerm)));
        } catch (Exception e) {
            //throw AHMS_ExceptionHandling.lightningException(e.getMessage());
        }
    }

    public static List<SObject> sortResults(List<SObject> resultList){
        return resultList;
    }

    public class Configuration {
        @AuraEnabled
        public String 
            sObjectType, 
            sObjectField;
        @AuraEnabled
        public Integer recordLimit = 5;
        @AuraEnabled
        public List<String> 
            resultFieldList = new List<String>(), 
            conditions = new List<String>(), 
            orderBy = new List<String>();
        public String generateQuery(String searchTerm){
            if (String.isBlank(this.sObjectField) || String.isBlank(this.sObjectType)){
                throw new DevelopmentException('sObjectField and sObjectType are required.');
            }
            if (this.resultFieldList == null){
                this.resultFieldList = new List<String>{this.sObjectField};
            } else {
                this.resultFieldList.add(this.sObjectField);
            }
            if(String.isNotBlank(searchTerm)) {
                conditions.add(this.sObjectField + ' LIKE \'%' + searchTerm + '%\'');
            }
            if (this.orderBy == null){
                this.orderBy = new List<String>{this.sObjectField + ' ASC'};
            } else if (this.orderBy.isEmpty()){
                this.orderBy.add(this.sObjectField + ' ASC');
            }
            return String.format(QUERY_FORMAT, new List<String>{
                String.join(resultFieldList, ', '),
                this.sObjectType,
                String.join(conditions, ' AND '),
                String.join(orderBy, ', '),
                String.valueOf(this.recordLimit != null && this.recordLimit < 20 && this.recordLimit > 0 ? this.recordLimit : 5)
            });
        }
    }
}
