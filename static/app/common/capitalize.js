/**
 * Created by tuanha-01 on 5/23/2016.
 */

"use strict";

define(['angular'], function (angular) {

    var injectParams = [];

    var capitalizeWord = function () {
        return {
            require: 'ngModel',
            link: function (scope, element, attrs, modelCtrl) {
                var capitalize = function (inputValue) {
                    if (inputValue == undefined) inputValue = '';
                    var capitalized = inputValue.toUpperCase();
                    if (capitalized !== inputValue) {
                        modelCtrl.$setViewValue(capitalized);
                        modelCtrl.$render();
                    }
                    return capitalized;
                }
                modelCtrl.$parsers.push(capitalize);
                capitalize(scope[attrs.ngModel]); // capitalize initial value
            }
        }
    };

    capitalizeWord.$inject = injectParams;

    var capitalize = angular.module('myApp.Capitalize', [])
    capitalize.directive('capitalize', capitalizeWord)
});
