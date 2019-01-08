/*eslint-disable */
define(["knockout", "Magento_PageBuilder/js/events", "Magento_PageBuilder/js/resource/jquery/ui/jquery.ui.touch-punch", "underscore", "Magento_PageBuilder/js/binding/sortable", "Magento_PageBuilder/js/collection", "Magento_PageBuilder/js/config", "Magento_PageBuilder/js/content-type/root/content-type-collection", "Magento_PageBuilder/js/data-store", "Magento_PageBuilder/js/drag-drop/matrix", "Magento_PageBuilder/js/master-format/render", "Magento_PageBuilder/js/stage-builder", "Magento_PageBuilder/js/utils/promise-deferred"], function (_knockout, _events, _jqueryUi, _underscore, _sortable, _collection, _config, _contentTypeCollection, _dataStore, _matrix, _render, _stageBuilder, _promiseDeferred) {
  /**
   * Copyright © Magento, Inc. All rights reserved.
   * See COPYING.txt for license details.
   */
  var Stage =
  /*#__PURE__*/
  function () {
    "use strict";

    /**
     * Debounce the applyBindings call by 500ms to stop duplicate calls
     *
     * @type {(() => void) & _.Cancelable}
     */

    /**
     * @param {PageBuilderInterface} parent
     */
    function Stage(parent) {
      var _this = this;

      this.loading = _knockout.observable(true);
      this.showBorders = _knockout.observable(false);
      this.interacting = _knockout.observable(false);
      this.userSelect = _knockout.observable(true);
      this.focusChild = _knockout.observable(false);
      this.dataStore = new _dataStore();
      this.afterRenderDeferred = (0, _promiseDeferred)();
      this.template = "Magento_PageBuilder/content-type/preview";
      this.render = new _render();
      this.collection = new _collection();
      this.applyBindingsDebounce = _underscore.debounce(function () {
        _this.render.applyBindings(_this.root.children).then(function (renderedOutput) {
          return _events.trigger("stage:" + _this.id + ":masterFormatRenderAfter", {
            value: renderedOutput
          });
        });
      }, 500);
      this.parent = parent;
      this.id = parent.id;
      this.root = new _contentTypeCollection(_config.getConfig("root_config"), this.id);
      (0, _matrix.generateAllowedParents)(); // Fire an event after the DOM has rendered

      this.afterRenderDeferred.promise.then(function () {
        _events.trigger("stage:" + _this.id + ":renderAfter", {
          stage: _this
        });
      }); // Wait for the stage to be built alongside the stage being rendered

      Promise.all([(0, _stageBuilder)(this, this.parent.initialValue), this.afterRenderDeferred.promise]).then(this.ready.bind(this));
    }
    /**
     * Get template.
     *
     * @returns {string}
     */


    var _proto = Stage.prototype;

    _proto.getTemplate = function getTemplate() {
      return this.template;
    };
    /**
     * The stage has been initiated fully and is ready
     */


    _proto.ready = function ready() {
      _events.trigger("stage:" + this.id + ":readyAfter", {
        stage: this
      });

      this.loading(false);
      this.initListeners(); // Ensure we complete an initial save of the data within the stage once we're ready

      _events.trigger("stage:updateAfter", {
        stageId: this.id
      });
    };
    /**
     * Init listeners
     */


    _proto.initListeners = function initListeners() {
      var _this2 = this;

      this.collection.getChildren().subscribe(function () {
        return _events.trigger("stage:updateAfter", {
          stageId: _this2.id
        });
      }); // ContentType being removed from container

      _events.on("contentType:removeAfter", function (args) {
        if (args.stageId === _this2.id) {
          _this2.onContentTypeRemoved(args);
        }
      }); // Any store state changes trigger a stage update event


      this.dataStore.subscribe(function () {
        return _events.trigger("stage:updateAfter", {
          stageId: _this2.id
        });
      }); // Watch for stage update events & manipulations to the store, debounce for 50ms as multiple stage changes
      // can occur concurrently.

      _events.on("stage:updateAfter", function (args) {
        if (args.stageId === _this2.id) {
          _this2.applyBindingsDebounce();
        }
      });

      var interactionLevel = 0;

      _events.on("stage:interactionStart", function () {
        ++interactionLevel;

        _this2.interacting(true);
      });

      _events.on("stage:interactionStop", function (args) {
        var forced = _underscore.isObject(args) && args.force === true;
        interactionLevel = Math.max(interactionLevel - 1, 0);

        if (interactionLevel === 0 || forced) {
          _this2.interacting(false);

          if (forced) {
            interactionLevel = 0;
          }
        }
      });

      _events.on("stage:childFocusStart", function () {
        return _this2.focusChild(true);
      });

      _events.on("stage:childFocusStop", function () {
        return _this2.focusChild(false);
      });
    };
    /**
     * On content type removed
     *
     * @param params
     */


    _proto.onContentTypeRemoved = function onContentTypeRemoved(params) {
      params.parent.removeChild(params.contentType);
    };

    return Stage;
  }();

  return Stage;
});
//# sourceMappingURL=stage.js.map
