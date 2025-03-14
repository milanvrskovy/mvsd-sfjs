import { LightningElement, wire, api, track } from 'lwc';
import { getObjectInfo, getPicklistValues } from 'lightning/uiObjectInfoApi';
import { NavigationMixin } from 'lightning/navigation';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getCampaignItemList from '@salesforce/apex/AHMS_CampaignEvaluationTableController.getCampaignItemList';
import updateCampaignItems from '@salesforce/apex/AHMS_CampaignEvaluationTableController.updateCampaignItems';
import duplicateAbError from '@salesforce/label/c.ABTest_Duplicate_Error_Message';

import * as columns from './columns/campaignItemColumns.js';

const FIELD_VALIDATION = {
    storeNumbers: [
        {
            vciExclusive: false,
            regex: /^([0-9]{4}([,]?))+$/,
            errorMessage:
                'Please add store numbers in correct format, separated by a comma. E.g., 1421,1123,2141'
        }
    ],
    ABTest__c: [
        {
            vciExclusive: true,
            regex: /^.{2}$/,
            errorMessage:
                'Please follow the number and letter pattern (e.g. 1A, 2A etc.) in 1A/1B or 1V/2V field'
        },
        {
            vciExclusive: true,
            regex: /[0-9]{1}[A-Z]{1}/,
            errorMessage:
                'Please follow the number and letter pattern (e.g. 1A, 2A etc.) in 1A/1B or 1V/2V field'
        }
    ],
    ManualBlacklist__c: [
        {
            vciExclusive: false,
            regex: /^([0-9]{4}([,]?))+$/,
            errorMessage:
                'Please add store numbers in correct format, separated by a comma. E.g., 1421,1123,2141'
        }
    ],
    CrossSellNASA__c: [
        {
            vciExclusive: false,
            regex: /^[0-9,]+$/,
            errorMessage:
                'Please enter the Cross-sell NASA number(s) separated by a comma'
        }
    ],
    EvaluationNASA__c: [
        {
            vciExclusive: false,
            regex: /^[0-9,]+$/,
            errorMessage:
                'Please enter the Evaluation NASA number(s) separated by a comma'
        }
    ],
    Days_of_the_Week__c: [
        {
            vciExclusive: false,
            regex: /^(?:[1-7](?:;|$))+$/,
            errorMessage:
                'Days of the Week: bad value for restricted picklist field'
        }
    ]
};

const NUMBER_SET_FIELDS = [
    'Store_Numbers__c',
    'Control_Stores__c',
    'ConfirmedStoreNumbers__c',
    'Nasa_number__c',
    'EvaluationNASA__c',
    'Sample_NASA__c',
    'CrossSellNASA__c',
    'ManualBlacklist__c'
];

const ERROR_TITLE = 'Error on update';

export default class CampaignEvaluationTable extends NavigationMixin(
    LightningElement
) {
    @api recordId;
    @api viewAll = false;
    @track columns = columns.campaignItemColumns;
    @track evaluationReadyOptions = [];

    numberSetFieldList = NUMBER_SET_FIELDS;
    draftValues = [];
    draftValuesPersistent = [];
    loaded = true;
    modalContainer = false;
    selectedRow;
    campaignItems;
    error;
    _wiredResult;
    tempRow;
    fieldValidation = FIELD_VALIDATION;
    currentModal;
    label = {
        duplicateAbError
    };

    @wire(getObjectInfo, { objectApiName: 'ADvendio__Campaign_Item__c' })
    objectInfo;

    @wire(getPicklistValues, {
        recordTypeId: '$objectInfo.data.defaultRecordTypeId',
        fieldApiName: 'ADvendio__Campaign_Item__c.EvaluationReadySelection__c'
    })
    getPicklistValues({ error, data }) {
        if (data) {
            this.evaluationReadyOptions = data.values;
        } else if (error) {
            console.error('error retrieving picklist values : ', error);
        }
    }

    @wire(getCampaignItemList, { recordId: '$recordId' })
    getcampaignItems(result) {
        this._wiredResult = result;
        this.setupDataForTable(result.data);
        this.setupTableFormat();
    }

    handleCellChange(event) {
        if (this.draftValuesPersistent.length === 0) {
            this.draftValuesPersistent = event.detail.draftValues;
        } else {
            let draftItemExists = false;
            this.draftValuesPersistent.forEach((draftItem) => {
                if (draftItem.Id == event.detail.draftValues[0].Id) {
                    draftItemExists = true;
                    for (var key of Object.keys(event.detail.draftValues[0])) {
                        draftItem[key] = event.detail.draftValues[0][key];
                    }
                }
            });
            if (!draftItemExists) {
                this.draftValuesPersistent.push(event.detail.draftValues[0]);
            }
        }
    }

    setupDataForTable(result) {
        if (Array.isArray(result) && result.length > 0) {
            this.campaignItems = result;
            let copyData = JSON.parse(JSON.stringify(this.campaignItems));
            copyData.forEach((item) => {
                item['ConfirmedStoreNumbersLabel'] = this.generateStoreLabel(
                    item['ConfirmedStoreNumbers__c']
                );
                item['ManualStoreNumbersLabel'] = this.generateStoreLabel(
                    item['Control_Stores__c']
                );
                item['ManualBlacklistLabel'] = this.generateStoreLabel(
                    item['ManualBlacklist__c']
                );
                //to set Icon for add
                if (item['Id'].search('_') !== -1) {
                    item['dynamicIcon'] = 'action:delete';
                    item['actionName'] = 'delete';
                    item['alternativeText'] = 'Delete Row';
                } else {
                    item['dynamicIcon'] = 'action:add_relationship';
                    item['actionName'] = 'add';
                    item['alternativeText'] = 'Duplicate Row';
                }
            });
            this.campaignItems = [...copyData];
            this.campaignItems.forEach((element) => {
                element.evaluationReadyOptions = this.evaluationReadyOptions;
            });
        } else {
            this.campaignItems = undefined;
        }
    }

    setupTableFormat() {
        this.columnsWidthMode = this.viewAll ? 'auto' : 'fixed';
        this.columns.forEach((column) => {
            column.initialWidth = this.viewAll
                ? column.viewAllWidth
                : column.baseWidth;
        });
    }

    handleRefresh(event) {
        this.loaded = false;
        refreshApex(this._wiredResult)
            .then(() => (this.loaded = true))
            .catch(() => (this.loaded = true));
    }

    refreshCampaignItemData() {
        this.loaded = !this.loaded;
        getCampaignItemList({ recordId: this.recordId })
            .then((result) => {
                this.setupDataForTable(result);
                this.loaded = !this.loaded;
            })
            .catch((error) => {
                this.error = error;
                this.loaded = !this.loaded;
            });
    }

    generateStoreLabel(storeNumbers) {
        if (storeNumbers) {
            let storeArray = storeNumbers.split(',');
            return 'Stores(' + storeArray.length + ')';
        } else {
            storeNumbers = '';
            return 'Stores(0)';
        }
    }

    callRowAction(event) {
        this.selectedRow = event.detail.row;
        let actionName = event.detail.row.actionName;
        if (
            (typeof event.detail.action.name === 'string' ||
                event.detail.action.name instanceof String) &&
            event.detail.action.name.includes('modal')
        ) {
            actionName = 'modal';
            this.currentModal = event.detail.action;
            this.currentModal.fieldValue =
                this.selectedRow[this.currentModal.fieldName];
        }
        switch (actionName) {
            case 'modal':
                this.modalContainer = true;
                break;
            case 'add':
                this.addrow(this.selectedRow);
                break;
            case 'delete':
                this.deleteRow(this.selectedRow);
                break;
            default:
        }
    }

    closeModalAction() {
        this.modalContainer = false;
    }

    openViewAll() {
        this[NavigationMixin.Navigate]({
            type: 'standard__component',
            attributes: {
                componentName: 'c__AHMS_evaluationTableWrapper'
            },
            state: {
                c__recordId: this.recordId
            }
        });
    }

    closeViewAll() {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.recordId,
                actionName: 'view'
            }
        });
    }

    addrow(row) {
        let copyData = JSON.parse(JSON.stringify(this.campaignItems));
        let copyDraftData = JSON.parse(
            JSON.stringify(this.draftValuesPersistent)
        );
        let draftrow;
        this.tempRow = this.generateVirtualItem(row);
        let evaluationJson;
        if (row.Evaluation_JSON__c) {
            try {
                evaluationJson = JSON.parse(row.Evaluation_JSON__c);
            } catch (e) {
                //JSON is not okay
                evaluationJson = JSON.parse(
                    JSON.stringify(row.Evaluation_JSON__c)
                );
            }
            evaluationJson.push(this.tempRow);
        } else {
            let temp = [];
            temp.push(this.tempRow);
            evaluationJson = temp;
        }

        copyData.forEach((item) => {
            if (item['Id'] == row.Id) {
                item.Evaluation_JSON__c = evaluationJson;
            }
        });
        let isdraftAvailbale;
        copyDraftData.forEach((item) => {
            if (item['Id'] == row.Id) {
                isdraftAvailbale = true;
                item.Evaluation_JSON__c = JSON.stringify(evaluationJson);
            }
        });
        let index = this.findRowIndexById(row.Id);
        copyData.splice(index + 1, 0, this.tempRow);
        this.campaignItems = copyData;
        if (isdraftAvailbale) {
            this.draftValues = copyDraftData;
            this.draftValuesPersistent = this.draftValues;
        } else {
            draftrow = {
                Id: row.Id,
                Evaluation_JSON__c: JSON.stringify(evaluationJson)
            };
            this.draftValues = copyDraftData.concat([draftrow]);
            this.draftValuesPersistent = this.draftValues;
        }
    }

    generateVirtualItem(parentItem) {
        return {
            Name: parentItem.Name,
            Id: parentItem.Id + '_' + this.generateRandomString(3),
            ABTest__c: '',
            ConfirmedStoreNumbers__c: parentItem.ConfirmedStoreNumbers__c,
            ADvendio__AlternateId__c: this.generateStoreLabel(
                parentItem.ConfirmedStoreNumbers__c
            ),
            EvaluationNASA__c: parentItem.EvaluationNASA__c,
            Blacklist_Control_Stores__c: parentItem.Blacklist_Control_Stores__c,
            Start_Week_Pre_period__c: parentItem.Start_Week_Pre_period__c,
            Days_of_the_Week__c: parentItem.Days_of_the_Week__c,
            Number_of_Week__c: parentItem.Number_of_Week__c,
            CrossSellNASA__c: parentItem.CrossSellNASA__c,
            Sample_NASA__c: parentItem.Sample_NASA__c,
            EvaluationReady__c: parentItem.EvaluationReady__c,
            EvaluationReadySelection__c: parentItem.EvaluationReadySelection__c,
            ADvendio__Media_Campaign__c: parentItem.ADvendio__Media_Campaign__c,
            Reach__c: parentItem.Reach__c,
            Campaign_Item_ID__c: parentItem.Campaign_Item_ID__c,
            ADvendio__From_Date__c: parentItem.ADvendio__From_Date__c,
            ADvendio__Until_Date__c: parentItem.ADvendio__Until_Date__c,
            Year_Pre_period__c: parentItem.Year_Pre_period__c,
            From_Week_Year__c: parentItem.From_Week_Year__c,
            From_Week__c: parentItem.From_Week__c,
            Until_Week__c: parentItem.Until_Week__c,
            Until_Week_Year__c: parentItem.Until_Week_Year__c,
            OverlapBlacklist__c: parentItem.OverlapBlacklist__c,
            ABBlacklist__c: parentItem.ABBlacklist__c,
            ADvendio__Internal_comment__c:
                parentItem.ADvendio__Internal_comment__c,
            dynamicIcon: 'action:delete',
            actionName: 'delete',
            alternativeText: 'Delete Row'
        };
    }

    deleteRow(row) {
        //To get parent row
        let parentRow = this.getParentRow(row);
        let evaluationJson;
        if (parentRow.Evaluation_JSON__c) {
            //parse evaluationJson to array
            try {
                evaluationJson = JSON.parse(parentRow.Evaluation_JSON__c);
            } catch (e) {
                //JSON is not okay
                evaluationJson = JSON.parse(
                    JSON.stringify(parentRow.Evaluation_JSON__c)
                );
            }
            let index = -1;
            let removedIndex;
            //To get index of deleted row
            evaluationJson.forEach((item) => {
                index++;
                if (item['Id'] == row.Id) {
                    removedIndex = index;
                }
            });
            //Remove row from evaluationJson
            evaluationJson.splice(removedIndex, 1);
        }
        let isdraftAvailable;
        let copyDraftData = JSON.parse(
            JSON.stringify(this.draftValuesPersistent)
        );
        copyDraftData.forEach((item) => {
            if (item['Id'] == parentRow.Id) {
                isdraftAvailable = true;
                item.Evaluation_JSON__c = JSON.stringify(evaluationJson);
                if (evaluationJson.length == 0) {
                    item.ABTest__c = null;
                    item.Evaluation_JSON__c = null;
                }
            }
        });
        if (isdraftAvailable) {
            this.draftValues = copyDraftData;
            this.draftValuesPersistent = this.draftValues;
        } else {
            let draftrow = {
                Id: parentRow.Id,
                Evaluation_JSON__c: JSON.stringify(evaluationJson)
            };
            if (evaluationJson.length == 0) {
                draftrow.Evaluation_JSON__c = null;
                draftrow.ABTest__c = null;
            }
            this.draftValues = copyDraftData.concat([draftrow]);
            this.draftValuesPersistent = this.draftValues;
        }
        let copyData = JSON.parse(JSON.stringify(this.campaignItems));
        copyData.forEach((item) => {
            if (item['Id'] == parentRow.Id) {
                item['Evaluation_JSON__c'] =
                    evaluationJson.length == 0
                        ? ''
                        : JSON.stringify(evaluationJson);
            }
        });
        const index = this.findRowIndexById(row.Id);
        if (index !== -1) {
            copyData = copyData
                .slice(0, index)
                .concat(copyData.slice(index + 1));
        }
        this.campaignItems = copyData;
    }

    getParentRow(row) {
        let rowId = row.Id.split('_')[0];
        let parentRow;
        let copyData = JSON.parse(JSON.stringify(this.campaignItems));
        copyData.forEach((item) => {
            if (item['Id'] == rowId) {
                parentRow = item;
            }
        });
        return parentRow;
    }

    findRowIndexById(id) {
        let ret = -1;
        this.campaignItems.some((row, index) => {
            if (row.Id === id) {
                ret = index;
                return true;
            }
            return false;
        });
        return ret;
    }

    handleChange(event) {
        const storeFieldName = this.currentModal.fieldName;
        let updateItem = this.selectedRow;
        let storeNumbers = this.formatNumberSetFieldValue(
            this.template.querySelector('lightning-textarea').value
        );
        this.currentModal.fieldValue = storeNumbers;
        if (
            storeNumbers &&
            !this.fieldValidation['storeNumbers'][0].regex.test(storeNumbers)
        ) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message:
                        this.fieldValidation['storeNumbers'][0].errorMessage,
                    variant: 'Error'
                })
            );
        } else {
            let copyDraftData = JSON.parse(
                JSON.stringify(this.draftValuesPersistent)
            );
            let isDataFound = false;
            copyDraftData.forEach((item) => {
                if (item.Id === updateItem.Id) {
                    isDataFound = true;
                    item[storeFieldName] = storeNumbers;
                }
            });
            this.selectedRow[storeFieldName] = storeNumbers;
            if (!isDataFound) {
                let newEntry = {
                    Id: updateItem.Id
                };
                newEntry[storeFieldName] = storeNumbers;
                copyDraftData.push(newEntry);
            }
            this.draftValues = copyDraftData;
            this.draftValuesPersistent = this.draftValues;
            this.campaignItems.forEach((item) => {
                if (item.Id == updateItem.Id) {
                    item[this.currentModal.label.fieldName] =
                        this.generateStoreLabel(storeNumbers);
                }
            });
            this.closeModalAction();
        }
    }

    handleCancel() {
        try {
            let saveValues = this.evaluationReadyOptions;
            this.draftValues = [];
            this.draftValuesPersistent = [];
            this.evaluationReadyOptions = [];
            this.evaluationReadyOptions = saveValues;
            this.refreshCampaignItemData();
        } catch (error) {
            console.error('error handling cancel : ', error);
        }
    }

    async handleSave(event) {
        let updatedFields = event.detail.draftValues; //only contains fields currently changed
        let updatedDataMap = new Map();
        let valid = true;
        let successMsg = 'Campaign Items updated';
        const EVALUATIONFIELDS = [
            'ABTest__c',
            'ConfirmedStoreNumbers__c',
            'EvaluationNASA__c'
        ];
        //To check if virtual CI is updated and if yes then merge two draft rows to one row
        updatedFields.forEach((item) => {
            if (item.ABTest__c) {
                item.ABTest__c = item.ABTest__c.toUpperCase();
            }
            this.formatNumberSetFields(item);
            if (!this.validateItem(item)) {
                valid = false;
                return;
            }
            //To set custom msg for succes
            for (const key of Object.keys(item)) {
                if (EVALUATIONFIELDS.includes(key)) {
                    successMsg =
                        'Campaign Items updated. Please expect some delay before recalculation is done. Refresh the page to see the updated results later';
                }
            }
            if (item.Id.search('_') !== -1) {
                let parentRow = this.getParentRow(item);
                if (updatedDataMap.has(parentRow.Id)) {
                    let tempRow = updatedDataMap.get(parentRow.Id);
                    if (!tempRow.hasOwnProperty('Evaluation_JSON__c')) {
                        tempRow.Evaluation_JSON__c =
                            parentRow.Evaluation_JSON__c;
                    }
                    parentRow = tempRow;
                }
                let evaluationJson;
                if (parentRow.Evaluation_JSON__c) {
                    try {
                        evaluationJson = JSON.parse(
                            parentRow.Evaluation_JSON__c
                        );
                    } catch (e) {
                        //JSON is not okay
                        evaluationJson = JSON.parse(
                            JSON.stringify(parentRow.Evaluation_JSON__c)
                        );
                    }
                    for (const i in evaluationJson) {
                        if (evaluationJson[i].Id == item.Id) {
                            let temp = evaluationJson[i];
                            for (var key of Object.keys(item)) {
                                temp[key] = item[key];
                            }
                            evaluationJson[i] = temp;
                        }
                    }
                    parentRow.Evaluation_JSON__c =
                        JSON.stringify(evaluationJson);
                    updatedDataMap.set(parentRow.Id, parentRow);
                }
            } else if (updatedDataMap.has(item.Id)) {
                let temp = updatedDataMap.get(item.Id);
                for (var key of Object.keys(item)) {
                    if (key != 'Evaluation_JSON__c') {
                        temp[key] = item[key];
                    }
                }
                updatedDataMap.set(temp.Id, temp);
            } else {
                updatedDataMap.set(item.Id, item);
            }
            if (!item.Name && updatedDataMap.get(item.Id)) {
                this.campaignItems.forEach((campaignItem) => {
                    if (item.Id == campaignItem.Id) {
                        updatedDataMap.get(item.Id).Name = campaignItem.Name;
                    }
                });
            }
        });
        if (!this.validateABLabel(updatedDataMap)) {
            return;
        }

        if (!valid) {
            return;
        }
        try {
            // Pass edited fields to the updateCampaignItems Apex controller
            this.loaded = !this.loaded;
            const warning = await updateCampaignItems({
                campaignItemList: Array.from(updatedDataMap.values())
            });
            // Report success with a toast
            this.loaded = !this.loaded;
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: successMsg,
                    variant: 'success'
                })
            );
            if (warning) {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Warning',
                        message: warning,
                        variant: 'warning',
                        mode: 'sticky'
                    })
                );
            }
            // Clear all datatable draft values
            this.draftValues = [];
            // Display fresh data in the datatable
            this.draftValuesPersistent = [];
            await refreshApex(this._wiredResult);
        } catch (error) {
            this.loaded = !this.loaded;
            // Error Handling
            if (error.body.errors != null) {
                // Loop & Display Errors
                for (let index = 0; index < error.body.errors.length; index++) {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error on update',
                            message:
                                error.body.errors[index].errorCode +
                                '- ' +
                                error.body.errors[index].message,
                            variant: 'error',
                            mode: 'sticky'
                        })
                    );
                }
            }
            if (error.body.fieldErrors != null) {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error Updating Campaign Items',
                        message: Object.values(error.body.fieldErrors)[0][0][
                            'message'
                        ],
                        variant: 'error',
                        mode: 'sticky'
                    })
                );
            } else {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error Updating Campaign Items',
                        message: error.body.message,
                        variant: 'error',
                        mode: 'sticky'
                    })
                );
            }
        }
    }

    validateABLabel(updatedDataMap) {
        let copyData = JSON.parse(JSON.stringify(this.campaignItems));
        const campaignItemsMap = new Map(copyData.map((obj) => [obj.Id, obj]));
        let isError = false;
        let fullABMap = this.getFullABMap(updatedDataMap, campaignItemsMap);
        for (let [key, value] of updatedDataMap) {
            if (!isError) {
                let evaluationJson;
                if (value.Evaluation_JSON__c) {
                    try {
                        evaluationJson = JSON.parse(value.Evaluation_JSON__c);
                    } catch (e) {
                        evaluationJson = JSON.parse(
                            JSON.stringify(value.Evaluation_JSON__c)
                        );
                    }
                    if (
                        value.ABTest__c ||
                        (campaignItemsMap.has(value.Id) &&
                            campaignItemsMap.get(value.Id).ABTest__c)
                    ) {
                        evaluationJson.forEach((item) => {
                            if (item.ABTest__c === '') {
                                this.throwError(
                                    'ABTest should not be empty for Virtual Campaign Items'
                                );
                                isError = true;
                                return false;
                            } else if (value.ABTest__c == item.ABTest__c) {
                                this.throwError(
                                    value.ABTest__c +
                                        ': ' +
                                        this.label.duplicateAbError
                                );
                                isError = true;
                                return false;
                            } else {
                                for (let [itemId, otherABTest] of fullABMap) {
                                    if (
                                        itemId != item.Id &&
                                        item.ABTest__c == otherABTest
                                    ) {
                                        this.throwError(
                                            item.ABTest__c +
                                                ': ' +
                                                this.label.duplicateAbError
                                        );
                                        isError = true;
                                        return false;
                                    }
                                }
                            }
                        });
                    } else {
                        this.throwError(
                            'ABTest should not be empty if Virtual Campaign Items exists'
                        );
                        isError = true;
                        return false;
                    }
                } else if (
                    value.ABTest__c === '' &&
                    campaignItemsMap.has(value.Id) &&
                    campaignItemsMap.get(value.Id).Evaluation_JSON__c
                ) {
                    this.throwError(
                        'ABTest should not be empty if Virtual Campaign Items exists'
                    );
                    isError = true;
                    return false;
                }
                if (value.ABTest__c) {
                    for (let [itemId, otherABTest] of fullABMap) {
                        if (
                            itemId != value.Id &&
                            value.ABTest__c == otherABTest
                        ) {
                            this.throwError(
                                value.ABTest__c +
                                    ': ' +
                                    this.label.duplicateAbError
                            );
                            isError = true;
                            return false;
                        }
                    }
                }
            }
        }
        return !isError;
    }

    getFullABMap(updatedDataMap, campaignItemsMap) {
        let fullABMap = new Map();
        for (let [key] of campaignItemsMap) {
            if (key.search('_') !== -1) {
                continue;
            }
            fullABMap.set(
                key,
                updatedDataMap.get(key) &&
                    updatedDataMap.get(key).ABTest__c != undefined &&
                    updatedDataMap.get(key).ABTest__c !=
                        campaignItemsMap.get(key).ABTest__c
                    ? updatedDataMap.get(key).ABTest__c
                    : campaignItemsMap.get(key).ABTest__c
            );
            let jsonString =
                updatedDataMap.get(key) &&
                updatedDataMap.get(key).Evaluation_JSON__c
                    ? updatedDataMap.get(key).Evaluation_JSON__c
                    : campaignItemsMap.get(key).Evaluation_JSON__c;
            if (!jsonString) {
                continue;
            }
            let evaluationJson;
            try {
                evaluationJson = JSON.parse(jsonString);
            } catch (e) {
                evaluationJson = JSON.parse(JSON.stringify(jsonString));
            }
            evaluationJson.forEach((item) => {
                if (item.ABTest__c) {
                    fullABMap.set(item.Id, item.ABTest__c);
                }
            });
        }
        return fullABMap;
    }

    validateItem(item) {
        for (let [field, value] of Object.entries(item)) {
            if (this.fieldValidation[field]) {
                for (const i in this.fieldValidation[field]) {
                    if (
                        item.Id.search('_') == -1 &&
                        this.fieldValidation[field][i].vciExclusive
                    ) {
                        continue;
                    }
                    if (
                        value !== '' &&
                        !this.fieldValidation[field][i].regex.test(value)
                    ) {
                        this.dispatchEvent(
                            new ShowToastEvent({
                                title: 'Error on update',
                                message:
                                    this.fieldValidation[field][i].errorMessage,
                                variant: 'error',
                                mode: 'sticky'
                            })
                        );
                        return false;
                    }
                }
            }
        }
        return true;
    }

    generateRandomString(length) {
        const characters =
            'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let randomString = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            randomString += characters[randomIndex];
        }
        return randomString;
    }

    formatNumberSetFields(virtualItem) {
        for (let [field, value] of Object.entries(virtualItem)) {
            if (this.numberSetFieldList.includes(field) && value != '') {
                virtualItem[field] = this.formatNumberSetFieldValue(value);
            }
        }
    }

    throwError(errorMessage) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: ERROR_TITLE,
                message: errorMessage,
                variant: 'error',
                mode: 'sticky'
            })
        );
    }

    formatNumberSetFieldValue(value) {
        let result = value
            .replaceAll('\r\n', ',')
            .replaceAll('\n', ',')
            .replaceAll('\r', ',')
            .replaceAll('	', ',')
            .replaceAll(' ,', ',')
            .replaceAll(', ', ',')
            .replaceAll(' ;', ',')
            .replaceAll('; ', ',')
            .replaceAll(' ', ',')
            .replaceAll(';', ',')
            .replaceAll(',,', ',');
        if (result.slice(-1) == ',') {
            result = result.substring(0, result.length - 1);
        }
        return result;
    }
}
