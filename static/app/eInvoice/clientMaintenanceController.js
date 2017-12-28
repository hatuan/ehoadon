/**
 * Created by tuanha-01 on 5/13/2016.
 */
"use strict";

define(['angularAMD', 'jquery', 'ajaxService', 'alertsService', 'clientService'], function(angularAMD, $) {
    var injectParams = ['$scope', '$rootScope', '$state', '$window', 'moment', '$uibModal', '$uibModalInstance', 'alertsService', 'clientService', '$stateParams', '$confirm', 'Constants'];

    var clientMaintenanceController = function($scope, $rootScope, $state, $window, moment, $uibModal, $uibModalInstance, alertsService, clientService, $stateParams, $confirm, Constants) {
        
        $scope.initializeController = function() {
            $scope.Constants = Constants;
        
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
                    email: true
                }
            }
        };

        $scope.update = function(form) {
            if (form.validate()) {
                var _postCustomer = new Object();

                if(editCustomer.ID == null) {
                    $scope.EditCustomer.RecCreatedByID = $rootScope.currentUser.ID;
                    $scope.EditCustomer.RecCreated = new Date();
                    $scope.EditCustomer.RecModifiedByID = $rootScope.currentUser.ID;
                    $scope.EditCustomer.RecModified = new Date();

                    _postCustomer = $scope.EditCustomer;
                    _postCustomer.RecCreated = new moment($scope.EditCustomer.RecCreated).unix();
                    _postCustomer.RecModified = new moment($scope.EditCustomer.RecModified).unix();
                } else {
                    $scope.EditCustomer.RecModifiedByID = $rootScope.currentUser.ID;
                    $scope.EditCustomer.RecModified = new Date();

                    _postCustomer = $scope.EditCustomer;
                    _postCustomer.RecModifiedByID = $rootScope.currentUser.ID;
                    _postCustomer.RecModified = new moment($scope.EditCustomer.RecModified).unix();
                }
                clientService.updateCustomer(_postCustomer, $scope.customerUpdateCompleted, $scope.customerUpdateError)
            }
        };

        $scope.customerUpdateCompleted = function() {
        };

        $scope.customerUpdateError = function() {
            alertsService.RenderErrorMessage(response.Error);
        }
    };

    clientMaintenanceController.$inject = injectParams;
    angularAMD.controller('eInvoiceClientMaintenanceController', clientMaintenanceController);
});