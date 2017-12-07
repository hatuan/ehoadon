/**
 * Created by tuanha-01 on 5/13/2016.
 */
"use strict";

define(['application-configuration'], function (app) {

    var injectParams = ['$scope', '$rootScope'];

    var moduleController = function ($scope, $rootScope) {
        $scope.initializeController = function () {
            $scope.activeTab = 1;
        };
    }

    moduleController.$inject = injectParams;

    app.register.controller('ModuleController', moduleController);
});
