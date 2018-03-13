/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

import ko from "knockout";
import "mage/backend/tabs";
import PreviewBlock from "./block";
import GMap from "Magento_PageBuilder/js/component/map";

export default class Map extends PreviewBlock {

    /**
     * Renders the map and subscribe to position for updates
     *
     * @param {Element} element
     * @returns {void}
     */
    public renderMap(element: Element) {
        const preview = this.preview;
        preview.generateMap(element);
        preview.data.position.subscribe(()=>{
            preview.updateMap();
        });
    };

    /**
     * Generate maps
     *
     * @param {Element} element
     * @returns {void}
     */
    private generateMap(element: Element) {
        const position = this.data.position();
        let markers: any = [],
            centerCoord = {
                lat: 30.2672,
                lng: -97.7431,
            },
            options = {
                zoom: 8,
            };

        if(position !== "") {
            const pos = this.getPosition();
            markers = pos.markers;
            centerCoord = pos.latLng;
            options = {
              zoom: pos.zoom,
            };
        }
        this.map = new GMap(element, markers, centerCoord, options);
    }

    /**
     * Updates map
     *
     * @returns {void}
     */
    private updateMap() {
        const pos = this.getPosition();
        this.map.onUpdate(pos.markers, pos.latLng, pos.zoom);
    }

    /**
     * Get markers, center coordinates, and zoom from data.position
     *
     * @returns {Object}
     */
    private getPosition() {
        const positions = this.data.position().split(",");
        return {
            markers: [{
                lat: parseFloat(positions[0]),
                lng: parseFloat(positions[1]),
                }],
            latLng: {
                lat: parseFloat(positions[0]),
                lng: parseFloat(positions[1]),
            },
            zoom: parseInt(positions[2], 10),
        }
    }
}
