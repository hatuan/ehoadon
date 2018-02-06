/**
 * Created by tuanha-01 on 5/23/2016.
 */

"use strict";

define(['angular'], function (angular) {

    var injectParams = ['$scope', '$rootScope', '$auth', '$window'];

    var HeaderController = function ($scope, $rootScope, $auth, $window) {
        $scope.$on('$includeContentLoaded', function() {
            Layout.initHeader(); // init header
        });

        //$scope.currentUser = function() {
        //    return JSON.parse($window.localStorage && $window.localStorage.getItem('currentUser'))
        //}
    }

    HeaderController.$inject = injectParams;

    var headerModule = angular.module('myApp.Header', [])
    headerModule.controller('HeaderController', HeaderController)
});
