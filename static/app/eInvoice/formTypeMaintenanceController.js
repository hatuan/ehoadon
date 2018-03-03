/**
 * Created by tuanha-01 on 5/13/2016.
 */
"use strict";

define(['angularAMD', 'jquery', 'ajaxService', 'alertsService', 'clientService', 'eInvoiceFormTypeService', 'reportjs-report', 'reportjs-viewer'], function(angularAMD, $) {
    var injectParams = ['$scope', '$rootScope', '$state', '$window', 'moment', '$uibModal', '$uibModalInstance', 'ajaxService', 'alertsService', 'clientService', 'eInvoiceFormTypeService', '$stateParams', '$confirm', 'Constants', 'editFormType'];

    var formTypeMaintenanceController = function($scope, $rootScope, $state, $window, moment, $uibModal, $uibModalInstance, ajaxService, alertsService, clientService, eInvoiceFormTypeService, $stateParams, $confirm, Constants, editFormType) {
       
        $scope.initializeController = function() {
            $scope.Constants = Constants;
            $scope.EditFormType = editFormType;
            $scope.Client = {};
            $scope.FormVars = {};

            if($scope.EditFormType.ID == null) {
                $scope.EditFormType.ID = "";
                $scope.EditFormType.InvoiceType = '';
                $scope.EditFormType.NumberForm = '';
                $scope.EditFormType.NumberForm2 = '0';
                $scope.EditFormType.NumberForm3 = '';
                $scope.EditFormType.InvoiceForm = '';
                $scope.EditFormType.Symbol = ''; 
                $scope.EditFormType.SymbolPart1 = '';
                $scope.EditFormType.SymbolPart2 = ("" + (new Date()).getFullYear()).substring(2,4);
                $scope.EditFormType.FormFileName = '';

                $scope.EditFormType.Status = $scope.Constants.Status[1].Code;
                $scope.EditFormType.RecCreatedByID = $rootScope.currentUser.ID;
                $scope.EditFormType.RecCreatedByUser = $rootScope.currentUser.Name;
                $scope.EditFormType.RecCreated = new Date();
                $scope.EditFormType.RecModifiedByID = $rootScope.currentUser.ID;
                $scope.EditFormType.RecModifiedByUser = $rootScope.currentUser.Name;
                $scope.EditFormType.RecModified = new Date();
            } else {
                var indexOfslash = $scope.EditFormType.NumberForm.indexOf("/");
                $scope.EditFormType.NumberForm2 = $scope.EditFormType.NumberForm.substring($scope.EditFormType.InvoiceType.length, indexOfslash);
                $scope.EditFormType.NumberForm3 = $scope.EditFormType.NumberForm.substring(indexOfslash + 1);

                indexOfslash = $scope.EditFormType.Symbol.indexOf("/");
                $scope.EditFormType.SymbolPart1 = $scope.EditFormType.Symbol.substring(0, indexOfslash);
                $scope.EditFormType.SymbolPart2 = $scope.EditFormType.Symbol.substring(indexOfslash + 1, $scope.EditFormType.Symbol.length - 1);

                try {
                    $scope.FormVars = JSON.parse($scope.EditFormType.FormVars);
                } catch(e) {
                    $scope.FormVars = {};
                    delete $scope.EditFormType.FormVars;
                }
                
            }

            $scope.getClient();
        };

        $scope.$watch(function(scope) {
            var _numberForm3 = ("000" + scope.EditFormType.NumberForm3).substring(scope.EditFormType.NumberForm3.length);
            var _return = scope.EditFormType.InvoiceType + scope.EditFormType.NumberForm2 + "/" + _numberForm3; 
            return _return; 
        }, function(newValue, oldValue) {
            $scope.EditFormType.NumberForm = newValue;
        });

        $scope.$watch(function(scope) {
            return scope.EditFormType.SymbolPart1 + "/" + scope.EditFormType.SymbolPart2 + scope.EditFormType.InvoiceForm; 
        }, function(newValue, oldValue, scope) {
            scope.EditFormType.Symbol = newValue;
        });

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
                var _postFormType = new Object();
                $scope.EditFormType.NumberForm3 = ("000" + $scope.EditFormType.NumberForm3).substring($scope.EditFormType.NumberForm3.length);
                $scope.EditFormType.NumberForm = $scope.EditFormType.InvoiceType + $scope.EditFormType.NumberForm2 + "/" + $scope.EditFormType.NumberForm3;
                $scope.EditFormType.Symbol = $scope.EditFormType.SymbolPart1 + "/" + $scope.EditFormType.SymbolPart2 + $scope.EditFormType.InvoiceForm;
                $scope.EditFormType.FormVars = JSON.stringify($scope.FormVars);
                
                if($scope.EditFormType.ID == "") {
                    $scope.EditFormType.ID = null;
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
                    _postFormType.RecCreated = new moment($scope.EditFormType.RecCreated).unix();
                    _postFormType.RecModifiedByID = $rootScope.currentUser.ID;
                    _postFormType.RecModified = new moment($scope.EditFormType.RecModified).unix();
                }
                
                eInvoiceFormTypeService.updateFormType(_postFormType, $scope.formTypeUpdateCompleted, $scope.formTypeUpdateError)
            }
        };
        
        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.formTypeUpdateCompleted = function(response, status) {
            var _result = new Object();
            _result.SelectReports = false;
            _result.EditFormType = response.Data.eInvoiceFormType;

            $uibModalInstance.close(_result);
        };

        $scope.formTypeUpdateError = function(response, status) {
            alertsService.RenderErrorMessage(response.Error);
        };

        $scope.getClient = function() {
            clientService.getClient($scope.clientInquiryCompleted, $scope.clientInquiryError);
        };

        $scope.clientInquiryCompleted = function(response, status) {
            $scope.Client = response.Data.Client;
            $scope.displayReport();
        };

        $scope.clientInquiryError = function(response) {
            alertsService.RenderErrorMessage(response.Error);
        }

        $scope.setFormVars = function() {
            if(angular.isUndefinedOrNull($scope.EditFormType.FormVars)) {
                $scope.FormVars.InvoiceType = $scope.EditFormType.InvoiceType; 
                $scope.FormVars.NumberForm = $scope.EditFormType.NumberForm;
                $scope.FormVars.Symbol = $scope.EditFormType.Symbol;
                $scope.FormVars.CompanyName = $scope.Client.Description;
                $scope.FormVars.CompanyVatNumber = $scope.Client.VatNumber;
                $scope.FormVars.CompanyAddress = $scope.Client.Address;
                $scope.FormVars.CompanyPhone = $scope.Client.Telephone;
                $scope.FormVars.CompanyEmail = $scope.Client.Email;
                $scope.FormVars.CompanyURL = $scope.Client.Website;
                $scope.FormVars.CompanyImageHeader = $scope.Client.Image;
                $scope.FormVars.InvoiceNo = "0000000";

                var qr = new QRious({
                    level: 'H',
                    value: $scope.FormVars.NumberForm + 
                        "|" + $scope.FormVars.CompanyVatNumber + 
                        "|" + $scope.FormVars.Symbol + 
                        "|" + $scope.FormVars.InvoiceNo + 
                        "|" + "" + //CustomerVatNumber
                        "|" + "0" + //TotalPayment
                        "|" + "0" + //TotalVat
                        "|" + "" //InvoiceDate
                });
                $scope.FormVars.InvoiceImageQR = qr.toDataURL();
            }
        }
        
        $scope.refreshReport = function() {
            delete $scope.EditFormType.FormVars;
            $scope.displayReport();
        };

        $scope.displayReport = function(){
            $scope.setFormVars();

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
                viewer.options.toolbar.zoom = 75;
                viewer.options.appearance.scrollbarsMode = true;
                viewer.options.width = "100%";
                viewer.options.height = $("#modal-body").height() + "px";
                viewer.renderHtml('reportviewer');
            
				var report = new $window.Stimulsoft.Report.StiReport();
                report.load($scope.EditFormType.FormFile);
                $scope.EditFormType.FormFile = report.saveToJsonString();

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

        $scope.selectReports = function() {
            var _result = new Object();
            _result.EditFormType = $scope.EditFormType;
            _result.SelectReports = true;

            $uibModalInstance.close(_result);
        };
    };

    formTypeMaintenanceController.$inject = injectParams;
    angularAMD.controller('eInvoiceFormTypeMaintenanceController', formTypeMaintenanceController);
});