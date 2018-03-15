/**
 * Created by tuanha-01 on 5/13/2016.
 */
"use strict";

define(['angularAMD', 'jquery', 'alertsService', 'eInvoiceService'], function(angularAMD, $) {
    var injectParams = ['$scope', '$rootScope', 'moment', '$uibModal', '$uibModalInstance', 'alertsService', 'eInvoiceService', 'Constants', 'numberForms', 'symbols'];

    var invoiceAdjSelectController = function($scope, $rootScope, moment, $uibModal, $uibModalInstance, alertsService, eInvoiceService, Constants, numberForms, symbols) {
       
        $scope.initializeController = function() {
            $scope.Constants = Constants;
            $scope.NumberForms = numberForms;
            $scope.Symbols = symbols;
            $scope.EditInvoice = {};
        };

        $scope.validationOptions = {
            rules: {
                "NumberForm": {
                    required: true
                },
                "Symbol": {
                    required: true
                },
                "InvoiceNo": {
                    required: true,
                    digits: true,
                    maxlength: 7,
                },
                "AdjType": {
                    required: true
                },
            }
        };

        $scope.ok = function(form) {
            if (form.validate()) {
                var _getItem = new Object();
                _getItem.NumberForm = $scope.SearchNumberForm;
                _getItem.Symbol = $scope.SearchSymbol;
                _getItem.InvoiceNo = parseInt($scope.SearchInvoiceNo, 10);

                eInvoiceService.getInvoiceByNo(_getItem, $scope.getInvoiceCompleted, $scope.getInvoiceError)
            }
        };

        $scope.getInvoiceCompleted = function(response, status) {
            var _editInvoice = response.Data.eInvoice;
            _editInvoice.InvoiceDate = new moment.unix(_editInvoice.InvoiceDate).toDate();
            _editInvoice.RecCreated = new moment.unix(_editInvoice.RecCreated).toDate();
            _editInvoice.RecModified = new moment.unix(_editInvoice.RecModified).toDate();
            if (_editInvoice.ProcessInvoiceStatus != $scope.Constants.ProcessInvoiceStatus["HD_GOC"]) {
                alertsService.RenderFloatErrorMessage('Invoice: ' + $scope.SearchInvoiceNo + ' đã bị điều chỉnh hoặc thay thế, không phải hóa đơn gốc');
                return;
            }
            _editInvoice.OriginalInvoice = $.extend(true, {}, _editInvoice);

            _editInvoice.OriginalInvoiceID = _editInvoice.ID;
            _editInvoice.OriginalInvoiceDate = _editInvoice.InvoiceDate;
            _editInvoice.OriginalInvoiceNo = _editInvoice.InvoiceNo;
            _editInvoice.OriginalFormTypeNumberForm = _editInvoice.FormTypeNumberForm;
            _editInvoice.OriginalFormTypeSymbol = _editInvoice.FormTypeSymbol;

            _editInvoice.ID = null;
            _editInvoice.InvoiceDate = $rootScope.Preference.WorkingDate;;
            _editInvoice.InvoiceNo = "";
            _editInvoice.FormTypeNumberForm = "";
            _editInvoice.FormTypeSymbol = "";

            _editInvoice.Status = $scope.Constants.InvoiceStatus[0].Code;
            _editInvoice.RecCreatedByID = $rootScope.currentUser.ID;
            _editInvoice.RecCreatedByUser = $rootScope.currentUser.Name;
            _editInvoice.RecCreated = new Date();
            _editInvoice.RecModifiedByID = $rootScope.currentUser.ID;
            _editInvoice.RecModifiedByUser = $rootScope.currentUser.Name;
            _editInvoice.RecModified = new Date();

            for(var i = 0, len = _editInvoice.InvoiceLines.length; i < len; i ++) {
                var _invoiceLine = _editInvoice.InvoiceLines[i];
                _invoiceLine.ID = null;
            }

            var _result = new Object();
            _result.EditInvoice = _editInvoice;
            _result.AdjType = $scope.AdjType;
            $uibModalInstance.close(_result);
        };

        $scope.getInvoiceError = function(response, status) {
            if(status = 404) {
                alertsService.RenderFloatErrorMessage('Invoice: ' + $scope.SearchInvoiceNo + ' not found!' );
            } else {
                alertsService.RenderFloatErrorMessage( response.ReturnMessage );
            }
        };

        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };
    };

    invoiceAdjSelectController.$inject = injectParams;
    angularAMD.controller('eInvoiceAdjSelectController', invoiceAdjSelectController);
});