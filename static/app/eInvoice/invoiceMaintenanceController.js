/**
 * Created by tuanha-01 on 5/13/2016.
 */
"use strict";

define(['angularAMD', 'jquery', 'ajaxService', 'alertsService', 'eInvoiceService'], function(angularAMD, $) {
    var injectParams = ['$scope', '$rootScope', '$state', '$window', 'moment', '$uibModal', '$uibModalInstance', 'ajaxService', 'alertsService', 'eInvoiceService', '$stateParams', '$confirm', 'Constants', 'editInvoice'];

    var invoiceMaintenanceController = function($scope, $rootScope, $state, $window, moment, $uibModal, $uibModalInstance, ajaxService, alertsService, eInvoiceService, $stateParams, $confirm, Constants, editInvoice) {
       
        $scope.initializeController = function() {
            $scope.Constants = Constants;
            $scope.EditInvoice = editInvoice;
        };

        $scope.validationOptions = {
            rules: {
                "InvoiceType": {
                    required: true
                },
                "NumberForm2": {
                    required: true
                },
                "NumberForm3": {
                    required: true
                },
                "SymbolPart1": {
                    required: true
                },
                "SymbolPart2": {
                    required: true
                },
                "InvoiceForm": {
                    required: true
                },
            }
        };

        $scope.ok = function(form) {
            if (form.validate()) {
                var _postInvoice = new Object();
                $scope.EditInvoice.NumberForm3 = ("000" + $scope.EditInvoice.NumberForm3).substring($scope.EditInvoice.NumberForm3.length);
                $scope.EditInvoice.NumberForm = $scope.EditInvoice.InvoiceType + $scope.EditInvoice.NumberForm2 + "/" + $scope.EditInvoice.NumberForm3;
                $scope.EditInvoice.Symbol = $scope.EditInvoice.SymbolPart1 + "/" + $scope.EditInvoice.SymbolPart2 + $scope.EditInvoice.InvoiceForm;

                if($scope.EditInvoice.ID == "") {
                    $scope.EditInvoice.ID = null;
                    $scope.EditInvoice.RecCreatedByID = $rootScope.currentUser.ID;
                    $scope.EditInvoice.RecCreated = new Date();
                    $scope.EditInvoice.RecModifiedByID = $rootScope.currentUser.ID;
                    $scope.EditInvoice.RecModified = new Date();

                    _postInvoice = $scope.EditInvoice;
                    _postInvoice.RecCreated = new moment($scope.EditInvoice.RecCreated).unix();
                    _postInvoice.RecModified = new moment($scope.EditInvoice.RecModified).unix();
                } else {
                    $scope.EditInvoice.RecModifiedByID = $rootScope.currentUser.ID;
                    $scope.EditInvoice.RecModified = new Date();

                    _postInvoice = $scope.EditInvoice;
                    _postInvoice.RecCreated = new moment($scope.EditInvoice.RecCreated).unix();
                    _postInvoice.RecModifiedByID = $rootScope.currentUser.ID;
                    _postInvoice.RecModified = new moment($scope.EditInvoice.RecModified).unix();
                }
                
                eInvoiceService.updateInvoice(_postInvoice, $scope.invoiceUpdateCompleted, $scope.invoiceUpdateError)
            }
        };
        
        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.invoiceUpdateCompleted = function(response, status) {
            var _result = new Object();
            _result.SelectReports = false;
            _result.EditInvoice = $scope.EditInvoice;

            $uibModalInstance.close(_result);
        };

        $scope.invoiceUpdateError = function(response, status) {
            alertsService.RenderErrorMessage(response.Error);
        };
    };

    invoiceMaintenanceController.$inject = injectParams;
    angularAMD.controller('eInvoiceMaintenanceController', invoiceMaintenanceController);
});