/**
 * Created by tuanha-01 on 5/13/2016.
 */
"use strict";

define(['application-configuration', 'alertsService'], function (app) {
    var injectParams = ['$scope', '$rootScope', '$auth', 'alertsService', '$state', '$http', '$window'];

    var LoginController = function ($scope, $rootScope, $auth, alertsService, $state, $http, $window) {

        $rootScope.closeAlert = alertsService.closeAlert;
        $rootScope.alerts = [];

        $scope.initializeController = function () {
            
            $rootScope.currentUser = {};
            
            $window.localStorage.removeItem("authenticated");
            $window.localStorage.removeItem("currentUser");
            $window.localStorage.removeItem("satellizer_Token");

            $scope.UserName = "";
            $scope.Password = "";
        };

        $scope.login = function () {
            
            var credentials = $scope.createLoginCredentials();
            $auth.login(credentials)
                .then(function () {
                    // Return an $http request for the now authenticated
                    // user so that we can flatten the promise chain
                    return $http.get("/api/token-auth");
                    //Handle error
                }, function (response) {
                    // Because we returned the $http.get request in the $auth.login
                    // promise, we can chain the next promise to the end here
                    
                    // Show Message Alert
                    if (response.status == 422) {
                        alertsService.RenderFloatErrorMessage('Please Enter Your Email And Password');
                    }
                    else if (response.status == 401) {
                        alertsService.RenderFloatErrorMessage(response.data.ReturnMessage[0]);
                    }
                })
                .then(function (response) {
                    if (response !== undefined) {
                        alertsService.RenderFloatSuccessMessage('You have successfully signed in!');

                        $rootScope.currentUser = (response !== undefined) ? response.data : {};
                        $window.localStorage.setItem("currentUser", JSON.stringify($rootScope.currentUser));
                        
                        setTimeout(function () {
                            $state.go('preference');
                        }, 10);
                    }
                })
                .catch(function (error) {
                    $scope.clearValidationErrors();
                    alertsService.RenderFloatErrorMessage(error.status + ":" + error.data.message);
                });
        };

        $scope.clearValidationErrors = function () {
            $scope.UserNameInputError = false;
            $scope.PasswordInputError = false;
        };

        $scope.createLoginCredentials = function () {
            var user = new Object();
            user.username = $scope.UserName;
            user.password = $scope.Password;
            return user;
        }

    };

    LoginController.$inject = injectParams;
    app.register.controller('LoginController', LoginController);
});
