/**
 * Created by tuanha-01 on 5/13/2016.
 */
"use strict";

define(['angularAMD', 'jquery', 'ajaxService', 'alertsService', 'clientService', 'provinceService'], function(angularAMD, $) {
    var injectParams = ['$scope', '$rootScope', '$state', '$window', 'moment', 'alertsService', 'clientService', 'provinceService', '$stateParams', '$confirm', 'Constants'];

    var clientMaintenanceController = function($scope, $rootScope, $state, $window, moment, alertsService, clientService, provinceService, $stateParams, $confirm, Constants) {
        
        $scope.initializeController = function() {
            $scope.Constants = Constants;
            $scope.Client = {};
            $scope.Token = {};
            $scope.Provinces = [];

            $scope.getProvinces(function () { //success
                $scope.getClient();
            });
        };

        $scope.getProvinces = function(successFunction) {
            provinceService.getProvinces(
                function(response, status) { //success
                    $scope.Provinces = response;

                    successFunction();
                },
                function(response) { //error
                    alertsService.RenderErrorMessage(response.Error);
                }
            )
        }
        $scope.getClient = function() {
            clientService.getClient($scope.clientInquiryCompleted, $scope.clientInquiryError);
        };

        $scope.clientInquiryCompleted = function(response, status) {
            $scope.Client = response.Data.Client;
        };

        $scope.clientInquiryError = function(response) {
            alertsService.RenderErrorMessage(response.Error);
        }

        $scope.validationOptions = {
            rules: {
                "Description": {
                    required: true
                },
                "Address": {
                    required: true
                },
                "Email": {
                    required: true,
                    email: true
                },
                "RepresentativeName": {
                    required: true
                },
                "RepresentativePosition": {
                    required: true
                },
                "ContactName": {
                    required: true
                },
                "Mobile": {
                    required: true
                }
            }
        };

        $scope.update = function(form) {
            if (form.validate()) {
                var _postClient = new Object();

                if($scope.Client.ID == null) {
                    $scope.Client.RecCreatedByID = $rootScope.currentUser.ID;
                    $scope.Client.RecCreated = new Date();
                    $scope.Client.RecModifiedByID = $rootScope.currentUser.ID;
                    $scope.Client.RecModified = new Date();

                    _postClient = $scope.Client;
                    _postClient.RecCreated = new moment($scope.Client.RecCreated).unix();
                    _postClient.RecModified = new moment($scope.Client.RecModified).unix();
                } else {
                    $scope.Client.RecModifiedByID = $rootScope.currentUser.ID;
                    $scope.Client.RecModified = new Date();

                    _postClient = $scope.Client;
                    _postClient.RecModifiedByID = $rootScope.currentUser.ID;
                    _postClient.RecModified = new moment($scope.Client.RecModified).unix();
                }
                clientService.updateClient(_postClient, $scope.clientUpdateCompleted, $scope.clientUpdateError)
            }
        };

        $scope.clientUpdateCompleted = function(response, status) {
            $scope.Client = response.Data.Client;
        };

        $scope.clientUpdateError = function(responst) {
            alertsService.RenderErrorMessage(response.Error);
        }

        $scope.cancel = function() {
            $scope.getClient();
        }
    };

    clientMaintenanceController.$inject = injectParams;
    angularAMD.controller('eInvoiceClientMaintenanceController', clientMaintenanceController);
});