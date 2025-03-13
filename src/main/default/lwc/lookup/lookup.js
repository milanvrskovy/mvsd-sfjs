import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import search from '@salesforce/apex/AHMS_LookupController.search';

export default class Lookup extends NavigationMixin(LightningElement) {
    @api config;
    searchTerm;
    results;  
    error;  
    selectedAccountId;

    connectedCallback(){
        this.searchTerm = this.config.defaultValue;
    }

    onChange(event) {
        this.searchTerm = event.detail.value;
        if (this.searchTerm.length < this.config.minimumLength){
            this.results = undefined;
        } else {  
            search( { searchTerm: this.searchTerm, configurationInput: JSON.stringify(this.config) } )    
            .then( result => {  
                let tempAccounts = [];
                result.forEach( ( record ) => {
                    let tempRec = Object.assign( {}, record );      
                    tempRec.formattedName = tempRec.Name.replace( new RegExp( this.searchTerm, 'i' ),( value ) => `<b>${value}</b>` );                    
                    tempAccounts.push( tempRec );
                });
                this.results = tempAccounts.length > 0 ? tempAccounts : undefined;  
            } )  
            .catch( error => {  
                console.log( 'Error Occured', JSON.stringify( error ) );
                this.error = error;  
            } );  
        }
        try{
            this.dispatchEvent(new CustomEvent("valuechangeevent", {
                detail: {
                    value: this.searchTerm,
                    duplicate: this.hasDuplicate(),
                    fuzzyDuplicate: this.hasFuzzyDuplicate()
                }
            }));
        } catch(e){
            console.log(e);
        }
        
    }

    onSelect(event) {
        try {
            this[NavigationMixin.Navigate]({
                type: 'standard__recordPage',
                attributes: {
                    recordId: event.currentTarget.dataset.id,
                    objectApiName: 'Account',
                    actionName: 'view'
                },
            });
        } catch(e){
            console.log(e);
        }
    }

    hasDuplicate(){
        if (!this.results){
            return false;
        }
        for(let i = 0; i < this.results.length; i++){
            if (this.results[i].Name === this.searchTerm){
                return true;
            }
        }
        return false;
    }

    hasFuzzyDuplicate(){
        if (!this.results || this.results.length < this.config.minimumLength){
            return false;
        }
        return {
            matchAmount: this.results.length,
            matchSize: this.searchTerm.length
        };
    }
}