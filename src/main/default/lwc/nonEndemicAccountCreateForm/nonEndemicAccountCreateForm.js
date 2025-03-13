import { LightningElement, wire } from 'lwc';
import { getObjectInfo } from "lightning/uiObjectInfoApi";
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import createAccount from '@salesforce/apex/AHMS_NonEndemicAccountController.createAccount';
import ACCOUNT_OBJECT from "@salesforce/schema/Account";

export default class NonEndemicAccountCreateForm extends NavigationMixin(LightningElement) {
    modalContainer = false;
    accountName;
    loaded = false;
    showSpinner = false;
    cssLoaded = false;
    saveDisabled = false;
    lookupConfiguration = {
        sObjectType : 'Account',
        sObjectField : 'Name',
        conditions : [
            'RecordType.DeveloperName = \'Non_Endemic\''
        ],
        orderBy : ['Name ASC'],
        fieldLabel : 'Account Name',
        title : '',
        type : 'text',
        minimumLength: 2,
        required : true,
        resultsLabel : 'Existing Accounts:'
    };
    accountRecord = {
        description: ''
    };

    @wire(getObjectInfo, { objectApiName: ACCOUNT_OBJECT })
    wiredObjectInfo({ error, data }) {
        if (data) {
            this.objectInfo = data;
            this.loaded = true;
        } else if (error) {
            this.loaded = true;
        }
    }

    openModal(){
        this.modalContainer = true;
    }
    closeModal(){
        this.showSpinner = false;
        this.modalContainer = false;
    }
    handleValueChange(event){
        this.accountName = event.detail.value;
    }
    handleDescriptionChange(event){
        this.accountRecord.description = event.detail.value;
    }
    handleSubmit() {
        try {
            this.showSpinner = true;
            this.saveDisabled = true;
            createAccount({ name: this.accountName, description: this.accountRecord.description })
            .then(result => {
                this.handleSuccess(result);
            })
            .catch(error => {
                this.handleError(error);
            });
        } catch (e){
            console.log(e);
        }
    }
    handleError(error){
        let errorMessage = error.body.message;
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Insert failed', 
                message: errorMessage.length > 150 ? errorMessage.substring(0, 149) + '...' : errorMessage,
                variant: 'Error',
                mode: 'Sticky'
            })
        );
        this.showSpinner = false;
        this.saveDisabled = false;
    }
    handleSuccess(accountId){
        this.showSpinner = false;
        this.saveDisabled = false;
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: accountId,
                objectApiName: 'Account',
                actionName: 'view'
            },
        });
    }
}