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
            $scope.FormVars = {};
            try {
                $scope.FormVars = JSON.parse($scope.EditFormType.FormVars);
            } catch(e) {
                $scope.FormVars = {};
                delete $scope.EditFormType.FormVars;
            }
            $scope.displayReport();
        }

        $scope.ok = function(form) {
            $uibModalInstance.close();
        };
        
        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.displayReport = function(){
            if(!angular.isUndefinedOrNull($scope.EditFormType.FormFile)) {
                ajaxService.AjaxGet("/reports/invoice.json", $scope.getReportDataSuccessFunction, $scope.getReportDataErrorFunction);     
            } else if(!angular.isUndefinedOrNull($scope.EditFormType.FormFileName)) {
                ajaxService.AjaxGet("/reports/" + $scope.EditFormType.FormFileName + ".mrt", $scope.getReportDesignSuccessFunction, $scope.getReportDesignErrorFunction);
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
            response.Vars = $scope.FormVars;
            dataSet.readJson(response);

            setTimeout(function () {
                var viewer = new $window.Stimulsoft.Viewer.StiViewer(null, 'StiViewer', false);
                viewer.options.toolbar.visible = false;
                viewer.options.toolbar.viewMode = Stimulsoft.Viewer.StiWebViewMode.WholeReport;
                viewer.options.appearance.scrollbarsMode = true;
                viewer.options.width = "100%";
                viewer.options.height = $("#modal-body").height() + "px";
                viewer.renderHtml('reportviewer');
            
				var report = new $window.Stimulsoft.Report.StiReport();
                report.load($scope.EditFormType.FormFile);

                // Remove all connections in report template (they are used in the first place)
                report.dictionary.databases.clear();
                // Registered JSON data specified in the report with same name
                report.regData(dataSet.dataSetName, "", dataSet);

				// Assign the report to the viewer
                viewer.report = report;
			}, 10);
        };

        $scope.getReportDataErrorFunction = function(response, status) {
            alertsService.RenderErrorMessage(response.Error); 
        }
    };

    formTypeViewReportController.$inject = injectParams;
    angularAMD.controller('eInvoiceFormTypeViewReportController', formTypeViewReportController);
});