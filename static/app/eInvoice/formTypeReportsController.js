/**
 * Created by tuanha-01 on 5/13/2016.
 */
"use strict";

define(['angularAMD', 'jquery', 'ajaxService', 'alertsService', 'reportService'], function(angularAMD, $) {
    var injectParams = ['$scope', '$rootScope', '$state', '$window', 'moment', '$uibModal', '$uibModalInstance', 'ajaxService', 'alertsService', 'reportService', '$stateParams', '$confirm', 'Constants', 'editFormType'];

    var formTypeReportsController = function($scope, $rootScope, $state, $window, moment, $uibModal, $uibModalInstance, ajaxService, alertsService, reportService, $stateParams, $confirm, Constants, editFormType) {
        
        $scope.initializeController = function() {
            $scope.Constants = Constants;
            //$scope.Reports = [];
            $scope.ReportFile = 'Blank';
            //$scope.Reports.push($scope.ReportFile);
            $scope.EditFormType = editFormType;
            
            if (angular.isUndefinedOrNull(editFormType.InvoiceType))
                editFormType.InvoiceType = '';

            var searchSqlCondition = "report_id = 'EINV_" + editFormType.InvoiceType + "'";

            $scope.getReports(searchSqlCondition);
        }

        $scope.getReports = function (searchSqlCondition) {
            if(!angular.isUndefinedOrNull(searchSqlCondition))
                $scope.Search = searchSqlCondition;
            else
                $scope.Search = '';
                
            var formTypeReportInquiry = $scope.createFormTypeReportInquiryObject();
            reportService.getReports(formTypeReportInquiry, $scope.formTypeReportsInquiryCompleted, $scope.formTypeReportsInquiryError);
        };

        $scope.formTypeReportsInquiryCompleted = function (response, status) {
            alertsService.RenderSuccessMessage(response.ReturnMessage);
            $scope.Reports = response.Data.Reports;
            $scope.TotalRows = response.TotalRows;
        };

        $scope.formTypeReportsInquiryError = function (response, status) {
            alertsService.RenderErrorMessage(response.Error);
        }

        $scope.createFormTypeReportInquiryObject = function () {
            var formTypeReportInquiry = new Object();

            formTypeReportInquiry.Search = $scope.Search;
            return formTypeReportInquiry;
        }

        $scope.ok = function() {
            var _result = new Object();
            _result.EditFormType = $scope.EditFormType;
            _result.EditFormType.FormFileName = $scope.ReportFile;
            delete _result.EditFormType.FormFile; //Reset value, formTypeMaintenance will load new report from FormFileName
            delete _result.EditFormType.FormVars;
            $uibModalInstance.close(_result);
        };
        
        $scope.cancel = function() {
            var _result = new Object();
            _result.EditFormType = $scope.EditFormType;
            $uibModalInstance.dismiss(_result);
        };
    };

    formTypeReportsController.$inject = injectParams;
    angularAMD.controller('eInvoiceFormTypeReportsController', formTypeReportsController);
});