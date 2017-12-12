/**
 * Created by tuanha-01 on 5/13/2016.
 */
"use strict";

define(['angularAMD', 'jquery', 'ajaxService', 'alertsService', 'eInvoiceCustomerService'], function(angularAMD, $) {
    var injectParams = ['$scope', '$rootScope', '$state', '$window', 'moment', '$uibModal', '$uibModalInstance', 'alertsService', 'eInvoiceCustomerService', '$stateParams', '$confirm', 'Constants', 'editCustomer'];

    var customerMaintenanceController = function($scope, $rootScope, $state, $window, moment, $uibModal, $uibModalInstance, alertsService, eInvoiceCustomerService, $stateParams, $confirm, Constants, editCustomer) {
        $scope.Constants = Constants;
        $scope.EditCustomer = editCustomer;

        if($scope.EditCustomer.ID == null) {
            $scope.EditCustomer.Code = "";
            $scope.EditCustomer.Description = "";
            $scope.EditCustomer.VatNumber = "";
            $scope.EditCustomer.Address = "";
            $scope.EditCustomer.AddressTransition = "";
            $scope.EditCustomer.RepresentativeName = "";
            $scope.EditCustomer.RepresentativePosition = "";
            $scope.EditCustomer.BankAccount = "";
            $scope.EditCustomer.BankName = "";
            $scope.EditCustomer.ContactName = "";
            $scope.EditCustomer.Email = "";
            $scope.EditCustomer.Mobile = "";
            $scope.EditCustomer.Comment = "";

            $scope.EditCustomer.Status = $scope.Constants.Status[1].Code;
            $scope.EditCustomer.RecCreatedByID = $rootScope.currentUser.ID;
            $scope.EditCustomer.RecCreatedByUser = $rootScope.currentUser.Name;
            $scope.EditCustomer.RecCreated = new Date();
            $scope.EditCustomer.RecModifiedByID = $rootScope.currentUser.ID;
            $scope.EditCustomer.RecModifiedByUser = $rootScope.currentUser.Name;
            $scope.EditCustomer.RecModified = new Date();
        }

        $scope.validationOptions = {
            rules: {
                "Code": {
                    required: true,
                    remote: {
                        url: "api/check-unique",
                        type: "post",
                        data: {
                            UserID: function() {
                                return $rootScope.currentUser.ID
                            },
                            Table: "ehd_customer",
                            RecID: function() {
                                return $scope.EditCustomer.ID
                            }
                        }
                    }
                },
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

        $scope.ok = function(form) {
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
                eInvoiceCustomerService.updateCustomer(_postCustomer, $scope.customerUpdateCompleted, $scope.customerUpdateError)
            }
        };
        
        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.customerUpdateCompleted = function() {
            var _result = new Object();
            _result.EditCustomer = $scope.EditCustomer;
            $uibModalInstance.close(_result);
        };

        $scope.customerUpdateError = function() {
            alertsService.RenderErrorMessage(response.Error);
        }
    };

    customerMaintenanceController.$inject = injectParams;
    angularAMD.controller('eInvoiceCustomerMaintenanceController', customerMaintenanceController);
});