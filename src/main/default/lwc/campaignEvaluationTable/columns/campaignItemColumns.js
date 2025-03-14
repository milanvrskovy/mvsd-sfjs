export const campaignItemColumns = [
    {
        label: 'Campaign Item Name',
        fieldName: 'Name',
        editable: true,
        displayReadOnlyIcon: true,
        baseWidth: 130,
        viewAllWidth: 180
    },
    {
        label: '1A/1B or 1V/2V',
        fieldName: 'ABTest__c',
        editable: true,
        baseWidth: 80,
        viewAllWidth: 80
    },
    {
        label: 'Store Numbers',
        fieldName: 'ConfirmedStoreNumbers__c',
        editable: true,
        type: 'button',
        typeAttributes: {
            label: { fieldName: 'ConfirmedStoreNumbersLabel' },
            fieldLabel: 'Confirmed Store Numbers',
            name: 'modalConfirmedStoreNumbers',
            fieldName: 'ConfirmedStoreNumbers__c',
            variant: 'base'
        },
        baseWidth: 120,
        viewAllWidth: 120
    },
    {
        label: 'Evaluation NASAs',
        fieldName: 'EvaluationNASA__c',
        editable: true,
        baseWidth: 130,
        viewAllWidth: 180
    },
    {
        label: 'Cross-sell NASAs',
        fieldName: 'CrossSellNASA__c',
        editable: true,
        baseWidth: 130,
        viewAllWidth: 180
    },
    {
        label: 'Days',
        fieldName: 'Days_of_the_Week__c',
        editable: true,
        baseWidth: 110,
        viewAllWidth: 110
    },
    {
        label: 'From Week',
        fieldName: 'From_Week__c',
        editable: false,
        displayReadOnlyIcon: true,
        baseWidth: 100,
        viewAllWidth: 100
    },
    {
        label: 'Number of Weeks',
        fieldName: 'Number_of_Week__c',
        editable: false,
        displayReadOnlyIcon: true,
        baseWidth: 100,
        viewAllWidth: 100
    },
    {
        label: 'Include in Evaluation',
        fieldName: 'EvaluationReady__c',
        type: 'boolean',
        editable: true,
        baseWidth: 100,
        viewAllWidth: 100
    },
    {
        label: 'Include in Evaluation',
        fieldName: 'EvaluationReadySelection__c',
        type: 'customEvaluationReadySelection',
        editable: true,
        baseWidth: 130,
        viewAllWidth: 180,
        typeAttributes: {
            placeholder: 'Select an option',
            options: { fieldName: 'evaluationReadyOptions' },
            value: { fieldName: 'EvaluationReadySelection__c' },
            identifier: { fieldName: 'Id' }
        }
    },
    {
        label: 'Action',
        type: 'button-icon',
        fieldName: 'Evaluation_JSON__c',
        editable: true,
        typeAttributes: {
            iconName: { fieldName: 'dynamicIcon' },
            label: { fieldName: 'Evaluation_JSON__c' },
            name: { fieldName: 'actionName' },
            alternativeText: { fieldName: 'alternativeText' },
            variant: 'border-filled'
        },
        baseWidth: 60,
        viewAllWidth: 60
    },
    {
        label: 'Campaign Item Number',
        fieldName: 'Campaign_Item_ID__c',
        editable: false,
        baseWidth: 80,
        viewAllWidth: 180
    },
    {
        label: 'Sample NASAs',
        fieldName: 'Sample_NASA__c',
        editable: true,
        baseWidth: 130,
        viewAllWidth: 180
    },
    {
        label: 'Blacklist Control Stores',
        fieldName: 'Blacklist_Control_Stores__c',
        editable: false,
        displayReadOnlyIcon: true,
        baseWidth: 130,
        viewAllWidth: 220
    },
    {
        label: 'Manual Control Stores',
        fieldName: 'Control_Stores__c',
        editable: true,
        type: 'button',
        typeAttributes: {
            label: { fieldName: 'ManualStoreNumbersLabel' },
            fieldLabel: 'Manual Control Stores',
            name: 'modalManualStoreNumbers',
            fieldName: 'Control_Stores__c',
            variant: 'base'
        },
        baseWidth: 120,
        viewAllWidth: 120
    },
    {
        label: 'Manual Blacklist',
        fieldName: 'ManualBlacklist__c',
        editable: true,
        type: 'button',
        typeAttributes: {
            label: { fieldName: 'ManualBlacklistLabel' },
            fieldLabel: 'Manual Blacklist',
            name: 'modalManualBlacklist',
            fieldName: 'ManualBlacklist__c',
            variant: 'base'
        },
        baseWidth: 120,
        viewAllWidth: 120
    },
    {
        label: 'Comment',
        fieldName: 'ADvendio__Internal_comment__c',
        editable: true,
        baseWidth: 150,
        viewAllWidth: 180
    }
];
