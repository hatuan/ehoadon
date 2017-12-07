/**
 * Created by tuanha-01 on 2016-11-09.
 */
define(['angularAMD', 'jquery-ui'], function (angularAMD) {

    var injectParams = ['$http', '$interpolate', '$parse'];
    
    // Usage:

    //  <input type="text" class="form-control" autocomplete ng-model="criteria.employeeNumber" autocomplete-object="business_relation_type" autocomplete-id="BusinessRelationTypeID" />

    //  <input type="text" class="form-control" autocomplete url="/some/url" allow-custom-entry="true" ng-model="criteria.employeeNumber"  autocomplete-object="business_relation_type" autocomplete-id="BusinessRelationTypeID" autocomplete-value="Code" />

    //  <input type="text" class="form-control" autocomplete url="/some/url" label="{{lastName}}, {{firstName}} ({{username}})" ng-model="criteria.employeeNumber"  autocomplete-object="business_relation_type" autocomplete-id="BusinessRelationTypeID" autocomplete-value="Code" />

    var autocompleteDirective = function ($http, $interpolate, $parse) {
        return {
            restrict: 'A',
            require: ['ngModel'],
            compile: function (elem, attrs) {
                var
                    modelAccessor = $parse(attrs.ngModel),
                    labelExpression = "{{Code}} - {{Description}}",
                    url = "/api/autocomplete",
                    uiAutocomplete = attrs.uiAutocomplete,
                    autocompleteValue = attrs.autocompleteValue,
                    autocompleteIdAccessor = $parse(attrs.autocompleteId),
                    autocompleteUrl = attrs.autocompleteUrl;

                if (attrs.autocompleteLabel) {
                    labelExpression = attrs.autocompleteLabel;
                }
                if (attrs.autocompleteUrl) {
                    url = attrs.autocompleteUrl;
                }
                return function (scope, element, attrs) {
                    var
                        mappedItems = null,
                        allowCustomEntry = attrs.allowCustomEntry || false;

                    element.autocomplete({
                        source: function (request, response) {
                            $http({
                                url: url,
                                method: 'GET',
                                params: { object:uiAutocomplete, term: request.term }
                            }).success(function (data) {
                                    mappedItems = $.map(data, function (item) {
                                        var result = {};
                                        if (typeof item === 'string') {
                                            result.label = item;
                                            result.value = item;
                                            result.id = "";
                                            return result;
                                        }

                                        result.label = $interpolate(labelExpression)(item);

                                        if (autocompleteValue) {
                                            result.value = item[autocompleteValue];
                                        } else {
                                            result.value = item["Code"];
                                        }

                                        if(item["ID"]) {
                                            result.id = item["ID"];
                                        } else {
                                            result.id = "";
                                        }        
                                        return result;
                                    });

                                    return response(mappedItems);
                                });
                        },
                        select: function (event, ui) {
                            scope.$apply(function (scope) {
                                modelAccessor.assign(scope, ui.item.value);
                                autocompleteIdAccessor.assign(scope, ui.item.id);
                            });

                            if (attrs.onSelect) {
                                scope.$apply(attrs.onSelect);
                            }

                            element.val(ui.item.value);

                            event.preventDefault();
                        },
                        change: function () {
                            var currentValue = element.val(),
                                matchingItem = null;

                            if (allowCustomEntry) {
                                return;
                            }

                            if (mappedItems) {
                                for (var i = 0; i < mappedItems.length; i++) {
                                    if (mappedItems[i].value === currentValue) {
                                        matchingItem = mappedItems[i].value;
                                        break;
                                    }
                                }
                            }

                            if (!matchingItem) {
                                scope.$apply(function (scope) {
                                    modelAccessor.assign(scope, null);
                                    autocompleteIdAccessor.assign(scope, null);
                                });
                            }
                        }
                    });
                }
            },
        }
    };

    autocompleteDirective.$inject = injectParams;

    angularAMD.directive('uiAutocomplete', autocompleteDirective)
});
