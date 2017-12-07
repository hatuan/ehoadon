/**
 * Created by tuanha-01 on 5/23/2016.
 */

"use strict";

define(['angular'], function (angular) {

    var injectParams = ['$scope', '$rootScope', '$auth', '$window'];

    var NavBarController = function ($scope, $rootScope, $auth, $window) {
        //$scope.currentUser = function() {
        //    return JSON.parse($window.localStorage && $window.localStorage.getItem('currentUser'))
        //}
    }

    NavBarController.$inject = injectParams;

    var navbar = angular.module('myApp.NavBar', [])
    navbar.controller('NavBarController', NavBarController)
});
