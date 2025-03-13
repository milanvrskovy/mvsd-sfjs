import { LightningElement, api, track, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { getObjectInfo } from "lightning/uiObjectInfoApi";
import { getRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import ACCOUNT_OBJECT from "@salesforce/schema/Account";
import NAME_FIELD from "@salesforce/schema/Account.Name";

const fields = [NAME_FIELD];

export default class NonEndemicAccountName extends NavigationMixin(LightningElement) {
    @api recordId;
    @api recordTypeId;
    name;
    editMode = false;
    loaded = true;
    saveDisabled = false;
    lookupConfiguration = {
        sObjectType : 'Account',
        sObjectField : 'Name',
        conditions : [
            'RecordType.DeveloperName = \'Non_Endemic\''
        ],
        orderBy : ['Name ASC'],
        minimumLength: 2,
        fieldLabel : 'Account Name',
        required : true,
        type : 'text'
    }; 

    @wire(getObjectInfo, { objectApiName: ACCOUNT_OBJECT })
    objectInfo;

    @wire(getRecord, { recordId: "$recordId", fields })
    account;
    
    handleValueChange(event){
        this.name = event.detail.value;
    }
    handleEdit(){
        if (this.lookupConfiguration.conditions.length == 1){
            this.lookupConfiguration.conditions.push('Id != \'' + this.recordId + '\'');
        }
        this.lookupConfiguration.defaultValue = this.account.data.fields.Name.value;
        this.name = this.account.data.fields.Name.value;
        this.editMode = true;
    }
    handleSave(event){
        this.saveDisabled = true;
        this.loaded = false;
        event.preventDefault();
        let fields = event.detail.fields;
        fields.Name = this.name;
        this.template.querySelector('lightning-record-edit-form').submit(fields);     
    }
    handleSuccess(){
        this.saveDisabled = false;
        this.loaded = true;
        this.editMode = false;
    }
    handleError(event){
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Error',
                message: event.detail.detail,
                variant: 'Error',
                mode: 'Sticky'
            })
        );
        this.saveDisabled = false;
        this.loaded = true;
    }
    handleCancel(){
        this.editMode = false;
    }
}