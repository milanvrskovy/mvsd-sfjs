import { LightningElement, wire, api } from 'lwc';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import CAMPAIGN_ITEM from '@salesforce/schema/ADvendio__Campaign_Item__c';
import getRecord from '@salesforce/apex/AHMS_LightningUtil.getRecord';

const 
    STORENUM_FIELDS = [{apiName: "Store_Numbers__c", label: 'Store Numbers', order: 1}],
    ACTUAL_STORENUM_FIELDS = [{apiName:"Actual_Store_Numbers__c", label:"Actual Store Numbers", order: 1}],
    CONFIRMED_STORENUM_FIELDS = [{apiName:"ConfirmedStoreNumbers__c", label:"Confirmed Store Numbers", order: 1}];

export default class StoreNumbersSection extends LightningElement {
    @api recordId;
    sectionOpen = true;
    fieldSchema;
    fieldContent = {
        storenumFields: STORENUM_FIELDS,
        actualStorenumFields: ACTUAL_STORENUM_FIELDS,
        confirmedStorenumFields: CONFIRMED_STORENUM_FIELDS
    };
    fieldSchemaReady = false;
    recordReady = false;
    _wiredResult;
    record;
    showSpinner = false; 

    @wire(getObjectInfo, { objectApiName: CAMPAIGN_ITEM })
    campaignItemInfo({ data }) {
        if (data) {
            this.fieldSchema = data.fields;
            this.fieldSchemaReady = true;
        }
    }

    @wire(getRecord, { 
        fieldNames: ["Store_Numbers__c", "Actual_Store_Numbers__c", "ConfirmedStoreNumbers__c"], 
        recordId: '$recordId' 
    })
    getCampaignItemRecord(result) {
        this._wiredResult = result;
        if (result.data) {
            this.record = JSON.parse(result.data);
            this.addValuesToFieldContent(this.record);
            this.recordReady = true;
        } else if (result.error){
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Configuration Error - Please contact your administrator',
                    message: result.error.body.message,
                    variant: 'error',
                    mode: "sticky"                        
                })
            );
        }
    }
    
    addValuesToFieldContent(record){
        this.fieldContent.storenumFields.forEach(field => {
            field.value = record[field.apiName];
        });
        this.fieldContent.actualStorenumFields.forEach(field => {
            field.value = record[field.apiName];
        });
        this.fieldContent.confirmedStorenumFields.forEach(field => {
            field.value = record[field.apiName];
        });
    }

    async handleRefreshChildren(event) {
        await refreshApex(this._wiredResult);
        this.template.querySelectorAll('c-field-modal-display').forEach(childComponent => {
            childComponent.refresh(JSON.stringify(this.record));
        });
    }

    get ready(){
        return this.fieldSchemaReady && this.recordReady;
    }

    toggleSection() {
        let currentsection = this.template.querySelector('[data-id="store_numbers_section"]');
        if (this.sectionOpen) {
            currentsection.className = 'slds-section slds-is-close';
            this.sectionOpen = false;
        } else {
            currentsection.className = 'slds-section slds-is-open';
            this.sectionOpen = true;
        }
    }
}