import LightningDatatable from 'lightning/datatable';

import evaluationReadySelectionEditTemplate from './customCells/evaluationReadySelectionEditTemplate.html';
import evaluationReadySelectionViewTemplate from './customCells/evaluationReadySelectionViewTemplate.html';

export default class CampaignEvaluationTableCustomDataType extends LightningDatatable {
    static customTypes = {
        customEvaluationReadySelection: {
            template: evaluationReadySelectionViewTemplate,
            editTemplate: evaluationReadySelectionEditTemplate,
            standardCellLayout: true,
            typeAttributes: [
                'label',
                'options',
                'placeholder',
                'identifier',
                'value'
            ]
        }
    };
}
