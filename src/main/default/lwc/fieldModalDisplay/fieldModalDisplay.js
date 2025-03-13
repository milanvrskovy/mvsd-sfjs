import { LightningElement, api } from 'lwc';
import updateRecord from '@salesforce/apex/AHMS_LightningUtil.updateRecord';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const UPDATE_SUCCESS_MESSAGE = 'Please expect some delay before evaluation recalculation is done. Refresh the page to see the updated results later';

export default class FieldModalDisplay extends LightningElement {
    @api fieldContent;
    @api recordId;
    @api readOnly = false;
    @api label;
    showSpinner = false;
    modalContainer = false;
    linkLabel;
    fieldList;
    @api record;

    connectedCallback(){
        this.setContent();
        this.setLinkLabel();
    }

    setContent(){
        let fieldList = [];
        this.fieldContent.forEach(content => {
            let field = {
                label: content.label,
                value: content.value,
                apiName: content.apiName,
                isPicklist: content.isPicklist,
                order: (content.order) ? content.order : null,
                picklistValues: [{label: '--None--', value: ''}]
            };
            if (content.isPicklist){
                content.picklistValues.forEach(picklistValue => {
                    field.picklistValues.push({label: picklistValue, value: picklistValue});
                });
            }
            fieldList.push(field);
        });
        fieldList.sort(function(a, b) {
            return a.order - b.order;
        });
        this.fieldList = fieldList;
    }

    setLinkLabel() {
        if (this.fieldContent[0].isPicklist) {
            this.linkLabel = this.fieldContent[0].value ? this.fieldContent[0].value : '--None--' ;
        } else {
            const values = this.fieldList[0].value ? this.fieldList[0].value.split(',').map((value) => value.trim()) : [];
            this.linkLabel = `Stores (${values.length})`;
        }
    }

    openModal() {
        this.modalContainer = true;
    }

    closeModal() {
        this.modalContainer = false;
    }

    handleSave() {
        if (this.showSpinner) return;
        this.showSpinner = true; 
        let successMessage = 'Value updated';
        let recordCopy = JSON.parse(JSON.stringify(this.record));
        this.template.querySelectorAll('lightning-textarea').forEach(textareaElement => {
            if (recordCopy[textareaElement.name] != textareaElement.value){
                successMessage = UPDATE_SUCCESS_MESSAGE;
            }
            recordCopy[textareaElement.name] = textareaElement.value;
        });
        this.template.querySelectorAll('lightning-combobox').forEach(textareaElement => {
            recordCopy[textareaElement.name] = textareaElement.value;
        });
        this.record = recordCopy;
        updateRecord({ 
            recordJSON: JSON.stringify(this.record)
        }).then(() => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: successMessage,
                    variant: 'success'
                })
            );
            this.showSpinner = false; 
            this.modalContainer = false;
            this.sendUpdateEvent(this.record);
        }).catch((error) => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Update Error',
                    message: error.body.message,
                    variant: 'error',
                    mode: "sticky"                        
                })
            );
            this.showSpinner = false; 
        });
    }

    @api
    refresh(value) {
        this.fieldList.forEach(field => {
            field.value = JSON.parse(value)[field.apiName];
        });
        this.setContent();
        this.setLinkLabel();
    }

    sendUpdateEvent(record){
        this.dispatchEvent(new CustomEvent('refresh', { detail: JSON.stringify(record)}));
    }
}
