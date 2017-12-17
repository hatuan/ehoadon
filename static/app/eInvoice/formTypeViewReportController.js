/**
 * Created by tuanha-01 on 5/13/2016.
 */
"use strict";

define(['angularAMD', 'jquery', 'ajaxService', 'alertsService', 'eInvoiceFormTypeService', 'reportjs-report', 'reportjs-viewer'], function(angularAMD, $) {
    var injectParams = ['$scope', '$rootScope', '$state', '$window', 'moment', '$uibModal', '$uibModalInstance', 'ajaxService', 'alertsService', 'eInvoiceFormTypeService', '$stateParams', '$confirm', 'Constants', 'editFormType'];

    var formTypeViewReportController = function($scope, $rootScope, $state, $window, moment, $uibModal, $uibModalInstance, ajaxService, alertsService, eInvoiceFormTypeService, $stateParams, $confirm, Constants, editFormType) {
       
        $scope.initializeController = function() {
            $scope.Constants = Constants;
            $scope.EditFormType = editFormType;
          
            $scope.displayReport($scope.EditFormType.FormFileName, $scope.EditFormType.FormFile);
        }

        $scope.ok = function(form) {
            $uibModalInstance.close();
        };
        
        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.displayReport = function(formFileName, formFile){
            if(!angular.isUndefinedOrNull(formFile)) {
                ajaxService.AjaxGet("/reports/invoice.json", $scope.getReportDataSuccessFunction, $scope.getReportDataErrorFunction);     
            } else if(!angular.isUndefinedOrNull(formFileName)) {
                ajaxService.AjaxGet("/reports/" + formFileName + ".mrt", $scope.getReportDesignSuccessFunction, $scope.getReportDesignErrorFunction);
            }
        }

        $scope.getReportDesignSuccessFunction = function(response, status) {
            $scope.EditFormType.FormFile = response;
            ajaxService.AjaxGet("/reports/invoice.json", $scope.getReportDataSuccessFunction, $scope.getReportDataErrorFunction); 
        };

        $scope.getReportDesignErrorFunction = function(response, status) {
            alertsService.RenderErrorMessage(response.Error);   
        };

        $scope.getReportDataSuccessFunction = function(response, status) {
            var dataSet = new Stimulsoft.System.Data.DataSet("Invoice");
            dataSet.readJson(response);

            var viewer = new $window.Stimulsoft.Viewer.StiViewer(null, 'StiViewer', false);
            var report = new $window.Stimulsoft.Report.StiReport();
            report.load($scope.EditFormType.FormFile);
            $scope.EditFormType.FormFile = report.saveToJsonString();
            report.load($scope.EditFormType.FormFile);
            report.regData(dataSet.dataSetName, "", dataSet);

            viewer.options.toolbar.visible = false;
            viewer.options.toolbar.viewMode = Stimulsoft.Viewer.StiWebViewMode.WholeReport;
            viewer.options.appearance.scrollbarsMode = true;
            viewer.options.width = "100%";
            viewer.options.height = $("#modal-body").height() + "px";
            viewer.report = report;
            viewer.renderHtml('reportviewer');
        };

        $scope.getReportDataErrorFunction = function(response, status) {
            alertsService.RenderErrorMessage(response.Error); 
        }
    };

    formTypeViewReportController.$inject = injectParams;
    angularAMD.controller('eInvoiceFormTypeViewReportController', formTypeViewReportController);
});