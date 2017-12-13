/**
 * Created by tuanha-01 on 5/13/2016.
 */
"use strict";

define(['angularAMD', 'jquery', 'ajaxService', 'alertsService', 'eInvoiceFormTypeService', 'reportjs-report', 'reportjs-viewer'], function(angularAMD, $) {
    var injectParams = ['$scope', '$rootScope', '$state', '$window', 'moment', '$uibModal', '$uibModalInstance', 'ajaxService', 'alertsService', 'eInvoiceFormTypeService', '$stateParams', '$confirm', 'Constants', 'editFormType'];

    var formTypeMaintenanceController = function($scope, $rootScope, $state, $window, moment, $uibModal, $uibModalInstance, ajaxService, alertsService, eInvoiceFormTypeService, $stateParams, $confirm, Constants, editFormType) {
        $scope.Constants = Constants;
        $scope.EditFormType = editFormType;
      
        if($scope.EditFormType.ID == null) {
            
            $scope.EditFormType.Status = $scope.Constants.Status[1].Code;
            $scope.EditFormType.RecCreatedByID = $rootScope.currentUser.ID;
            $scope.EditFormType.RecCreatedByUser = $rootScope.currentUser.Name;
            $scope.EditFormType.RecCreated = new Date();
            $scope.EditFormType.RecModifiedByID = $rootScope.currentUser.ID;
            $scope.EditFormType.RecModifiedByUser = $rootScope.currentUser.Name;
            $scope.EditFormType.RecModified = new Date();
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
                            Table: "ehd_formType",
                            RecID: function() {
                                return $scope.EditFormType.ID
                            }
                        }
                    }
                },
                "Description": {
                    required: true
                },
            }
        };

        $scope.ok = function(form) {
            if (form.validate()) {
                var _postFormType = new Object();

                if(editFormType.ID == null) {
                    $scope.EditFormType.RecCreatedByID = $rootScope.currentUser.ID;
                    $scope.EditFormType.RecCreated = new Date();
                    $scope.EditFormType.RecModifiedByID = $rootScope.currentUser.ID;
                    $scope.EditFormType.RecModified = new Date();

                    _postFormType = $scope.EditFormType;
                    _postFormType.RecCreated = new moment($scope.EditFormType.RecCreated).unix();
                    _postFormType.RecModified = new moment($scope.EditFormType.RecModified).unix();
                } else {
                    $scope.EditFormType.RecModifiedByID = $rootScope.currentUser.ID;
                    $scope.EditFormType.RecModified = new Date();

                    _postFormType = $scope.EditFormType;
                    _postFormType.RecModifiedByID = $rootScope.currentUser.ID;
                    _postFormType.RecModified = new moment($scope.EditFormType.RecModified).unix();
                }
                eInvoiceFormTypeService.updateFormType(_postFormType, $scope.formTypeUpdateCompleted, $scope.formTypeUpdateError)
            }
        };
        
        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.formTypeUpdateCompleted = function() {
            var _result = new Object();
            _result.EditFormType = $scope.EditFormType;
            $uibModalInstance.close(_result);
        };

        $scope.formTypeUpdateError = function() {
            alertsService.RenderErrorMessage(response.Error);
        };

        var reportDesign = '';
        $scope.viewReport = function() {
            ajaxService.AjaxGet("/reports/01GTKT_001.mrt", $scope.getReportDesignSuccessFunction, $scope.getReportDesignErrorFunction); 
        };

        $scope.getReportDesignSuccessFunction = function(response, status) {
            reportDesign = response;
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
            report.load(reportDesign);
            report.regData(dataSet.dataSetName, "", dataSet);

            viewer.options.toolbar.visible = false;
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

    formTypeMaintenanceController.$inject = injectParams;
    angularAMD.controller('eInvoiceFormTypeMaintenanceController', formTypeMaintenanceController);
});