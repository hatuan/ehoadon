/**
 * Created by tuanha-01 on 5/13/2016.
 */
"use strict";

define(['application-configuration'], function (app) {

    var injectParams = ['$scope', '$rootScope', '$auth', '$window'];

    var HomeController = function ($scope, $rootScope, $auth, $window) {
        $scope.isAuthenticated = function() {
            return $auth.isAuthenticated();
        };

        $scope.currentUser = function() {
            return JSON.parse($window.localStorage && $window.localStorage.getItem('currentUser'))
        }

    }

    HomeController.$inject = injectParams;

    app.register.controller('HomeController', HomeController);
});
