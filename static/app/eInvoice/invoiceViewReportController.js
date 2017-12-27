/**
 * Created by tuanha-01 on 5/13/2016.
 */
"use strict";

define(['angularAMD', 'jquery', 'ajaxService', 'alertsService', 'eInvoiceService', 'eInvoiceFormTypeService', 'reportjs-report', 'reportjs-viewer'], function(angularAMD, $) {
    var injectParams = ['$scope', '$rootScope', '$state', '$window', 'moment', '$uibModal', '$uibModalInstance', 'ajaxService', 'alertsService', 'eInvoiceService', 'eInvoiceFormTypeService', '$stateParams', '$confirm', 'Constants', 'editInvoice'];

    var invoiceViewReportController = function($scope, $rootScope, $state, $window, moment, $uibModal, $uibModalInstance, ajaxService, alertsService, eInvoiceService, eInvoiceFormTypeService, $stateParams, $confirm, Constants, editInvoice) {
       
        $scope.initializeController = function() {
            $scope.Constants = Constants;
            $scope.EditInvoice = editInvoice;
            $scope.FormType = {};

            if(!angular.isUndefinedOrNull($scope.EditInvoice.FormTypeID))
                $scope.getFormType($scope.EditInvoice.FormTypeID);
        }

        $scope.signDocument = function() {
            
        };
        
        $scope.cancel = function() {
            var _result = new Object();
            _result.EditInvoice = $scope.EditInvoice;
            $uibModalInstance.dismiss(_result);
        };

        /*
        $scope.$on('modal.closing', function(event, reason, closed){
            event.preventDefault();

            var _result = new Object();
            _result.EditInvoice = $scope.EditInvoice;
            $uibModalInstance.dismiss(_result);            
        });
        */

        $scope.getFormType = function(_ID) {
            var formTypeInquiry = new Object();
            formTypeInquiry.ID = _ID

            eInvoiceFormTypeService.getFormType(
                formTypeInquiry, 
                function(response, status) { //success
                    $scope.FormType = response.Data.eInvoiceFormType;
                    
                    $scope.getInvoice($scope.EditInvoice.ID);
                },
                function(response) { //error
                    alertsService.RenderErrorMessage(response.Error);
                }
            )
        }

        $scope.getInvoice = function(_ID) {
            var invoiceInquiry = new Object();
            invoiceInquiry.ID = _ID
            eInvoiceService.getInvoice(
                invoiceInquiry, 
                function(response, status) { //success
                    $scope.EditInvoice = response.Data.eInvoice;
                    $scope.EditInvoice.InvoiceDate = new moment.unix($scope.EditInvoice.InvoiceDate).toDate();
                    $scope.getReport($scope.FormType.FormFileName, $scope.FormType.FormFile);        
                },
                function(response) { //error
                    alertsService.RenderErrorMessage(response.Error);
                }
            )
        };

        $scope.getReport = function(formFileName, formFile){
            if(!angular.isUndefinedOrNull(formFile)) {
                $scope.renderReport();     
            } else if(!angular.isUndefinedOrNull(formFileName)) {
                ajaxService.AjaxGet("/reports/" + formFileName + ".mrt", $scope.getReportDesignSuccessFunction, $scope.getReportDesignErrorFunction);
            }
        }

        $scope.getReportDesignSuccessFunction = function(response, status) {
            $scope.FormType.FormFile = response;
            $scope.renderReport(); 
        };

        $scope.getReportDesignErrorFunction = function(response, status) {
            alertsService.RenderErrorMessage(response.Error);   
        };

        $scope.renderReport = function() {
            var dataSet = new Stimulsoft.System.Data.DataSet("Invoice");
            var ds = {};
            ds.Invoice = $scope.EditInvoice;
            ds.InvoiceLines = $scope.EditInvoice.InvoiceLines;
            for(var _i = ds.InvoiceLines.length; _i < 10; _i++ ) {
                ds.InvoiceLines.push({LineNo: _i + 1});
            }
            dataSet.readJson(ds);

            var viewer = new $window.Stimulsoft.Viewer.StiViewer(null, 'StiViewer', false);
            var report = new $window.Stimulsoft.Report.StiReport();
            report.load($scope.FormType.FormFile);
            $scope.FormType.FormFile = report.saveToJsonString();
            report.load($scope.FormType.FormFile);
            report.regData(dataSet.dataSetName, "", dataSet);

            viewer.options.toolbar.visible = false;
            viewer.options.toolbar.viewMode = Stimulsoft.Viewer.StiWebViewMode.WholeReport;
            viewer.options.appearance.scrollbarsMode = true;
            viewer.options.width = "100%";
            viewer.options.height = $("#modal-body").height() + "px";
            viewer.report = report;
            viewer.renderHtml('reportviewer');
        };
    };

    invoiceViewReportController.$inject = injectParams;
    angularAMD.controller('eInvoiceViewReportController', invoiceViewReportController);
});