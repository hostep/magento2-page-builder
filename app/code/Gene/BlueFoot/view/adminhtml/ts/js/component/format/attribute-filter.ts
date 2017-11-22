/**
 * Copyright © 2013-2017 Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */
import {DataObject} from "../component/data-store";

export default class AttributeFilter {
    allowAttributes: Array<string> = [
        'name',
        'appearance',
        'src',
        'button_text',
        'label_text',
        'placeholder',
        'title',
        'identifier'
    ];

    /**
     * Filter allowed attributes from object
     *
     * @param {DataObject} data
     * @returns {DataObject}
     */
    filter(data: DataObject): DataObject {
        let attributes: DataObject = {};
        Object.keys(data).map(
            (key: string) => {
                if (this.allowAttributes.includes(key)) {
                    attributes[key] = data[key];
                }
            }
        );
        return attributes;
    }
}
