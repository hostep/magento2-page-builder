/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

import ko from "knockout";
import _, {Dictionary} from "underscore";
import Appearance from "../../appearance/appearance";
import {DataObject} from "../../data-store";
import StyleAttributeFilter from "../../format/style-attribute-filter";
import StyleAttributeMapper, {StyleAttributeMapperResult} from "../../format/style-attribute-mapper";
import Block from "../block";

interface PreviewData {
    [key: string]: KnockoutObservable<any>;
}

export default class PreviewBlock {
    public parent: Block;
    public config: any;
    public data: PreviewData = {};
    public previewStyle: KnockoutComputed<StyleAttributeMapperResult>;

    /**
     * @param {Block} parent
     * @param {object} config
     * @param {Appearance} appearance
     */
    constructor(parent: Block, config: object, appearance: Appearance) {
        const styleAttributeMapper = new StyleAttributeMapper();
        const styleAttributeFilter = new StyleAttributeFilter();

        this.parent = parent;
        this.config = config || {};

        this.setupDataFields();

        // Calculate the preview style utilising the style attribute mapper & appearance system
        this.previewStyle = ko.computed(() => {
            let data = _.mapObject(this.data, (value) => {
                if (ko.isObservable(value)) {
                    return value();
                }
                return value;
            });
            if (appearance && appearance.hasAppearances(data)) {
                data = appearance.add(data);
            }
            // Extract data values our of observable functions
            return this.afterStyleMapped(
                styleAttributeMapper.toDom(
                    styleAttributeFilter.filter(data),
                ),
            );
        });

        Object.keys(styleAttributeFilter.getAllowedAttributes()).forEach((key) => {
            if (ko.isObservable(this.data[key])) {
                this.data[key].subscribe(() => {
                    this.previewStyle.notifySubscribers();
                });
            }
        });
    }

    /**
     * Retrieve the template for the preview block
     *
     * @returns {string}
     */
    get template(): string {
        if (this.config.preview_template) {
            return this.config.preview_template;
        }
        return "";
    }

    /**
     * Update the data value of a part of our internal Knockout data store
     *
     * @param {string} key
     * @param value
     */
    public updateDataValue(key: string, value: any) {
        if (typeof this.data[key] !== "undefined" && ko.isObservable(this.data[key])) {
            this.data[key](value);
        } else {
            if (_.isArray(value)) {
                this.data[key] = ko.observableArray(value);
            } else {
                this.data[key] = ko.observable(value);
            }
        }
    }

    /**
     * Setup fields observables within the data class property
     */
    protected setupDataFields() {
        // Create an empty observable for all fields
        if (this.config.fields) {
            _.keys(this.config.fields).forEach((key: string) => {
                this.updateDataValue(key, "");
            });
        }

        // Subscribe to this blocks data in the store
        this.parent.stage.store.subscribe(
            (data: DataObject) => {
                _.forEach(data, (value, key) => {
                    this.updateDataValue(key, value);
                });
            },
            this.parent.id,
        );
    }

    /**
     * Callback function to update the styles are mapped
     *
     * @param {StyleAttributeMapperResult} styles
     * @returns {StyleAttributeMapperResult}
     */
    protected afterStyleMapped(styles: StyleAttributeMapperResult) {
        return styles;
    }
}
