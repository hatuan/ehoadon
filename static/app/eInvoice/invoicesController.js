/**
 * Created by tuanha-01 on 5/13/2016.
 */
"use strict";

define(['angularAMD', 'jquery', 'ajaxService', 'alertsService', 'select2', 'myApp.Search', 'eInvoiceService', 'digitalsignature', 'reportjs-report', 'reportjs-viewer', 'app/eInvoice/invoiceMaintenanceController', 'app/eInvoice/invoiceViewReportController', , 'app/eInvoice/invoiceSendController'], function (angularAMD, $) {
    var injectParams = ['$scope', '$rootScope', '$state', '$window', 'moment', '$uibModal', '$confirm', 'alertsService', 'Constants', 'eInvoiceService'];

    var eInvoicesController = function ($scope, $rootScope, $state, $window, moment, $uibModal, $confirm, alertsService, Constants, eInvoiceService) {

        $scope.initializeController = function () {
            $rootScope.applicationModule = "eInvoices";
            $rootScope.alerts = [];
            
            $scope.Constants = Constants;

            $scope.SearchNumberForm ="";
            $scope.SearchSymbol = "";
            $scope.SearchFromDate = null;
            $scope.SearchToDate = null;
            $scope.SearchCustomer = "";
            $scope.SearchStatus = "";
            $scope.SortExpression = "invoice_date";
            $scope.SortDirection = "DESC";
            $scope.FetchSize = 100;
            $scope.CurrentPage = 1;
            $scope.PageSize = 9;
            $scope.TotalRows = 0;
            $scope.Selection=[];

            $scope.searchConditionObjects = [];

            $scope.eInvoices = [];
            $scope.eInvoicesDisplay = [];
            $scope.selectedRow = null;
            $scope.isLoading = true;
            $scope.FilteredInvoices = [];
            $scope.selectViewReport = false;
            $scope.selectSendDocument = false;
            $scope.getInvoices();
        };

        $scope.search = function (form) {
            if(form.validate()) {
                $scope.getInvoices();
            }
        }

        $scope.searchValidationOptions = {
            rules: {
                FromDate: {
                    date: true,
                },
                ToDate: {
                    date: true,
                }
            }
        }

        $scope.delete = function (_index, _item) {
            $confirm({text: 'Are you sure you want to delete?', title: 'Delete', ok: 'Yes', cancel: 'No'})
            .then(function() {
                $scope.Selection = [];
                $scope.Selection.push(_item["ID"]);
                var deleteEInvoiceInvoices = $scope.createDeleteInvoiceObject()
                eInvoiceService.deleteInvoice(deleteEInvoiceInvoices, 
                    function (response, status) {
                        $scope.Selection = [];
                        $scope.eInvoicesDisplay.splice($scope.eInvoicesDisplay.indexOf(_item), 1);
                        $scope.eInvoices.splice($scope.eInvoices.indexOf(_item), 1);
                    }, 
                    function (response, status){
                        $scope.Selection = [];
                        alertsService.RenderErrorMessage(response.Error);
                });  
            });
        }

        $scope.toggleSelection = function (_id) {
             var idx = $scope.Selection.indexOf(_id);
             if (idx > -1) {
               $scope.Selection.splice(idx, 1);
             }
             else {
               $scope.Selection.push(_id);
             }
        };

        $scope.getInvoices = function () {
            var eInvoicesInquiry = $scope.createInvoiceObject();
            eInvoiceService.getInvoices(eInvoicesInquiry, $scope.eInvoicesInquiryCompleted, $scope.eInvoicesInquiryError);
        };

        $scope.eInvoicesInquiryCompleted = function (response, status) {
            alertsService.RenderSuccessMessage(response.ReturnMessage);
            $scope.eInvoices = response.Data.eInvoices;
            for (var i = 0, len = $scope.eInvoices.length; i < len; i++) {
                $scope.eInvoices[i].InvoiceDate = new moment.unix($scope.eInvoices[i].InvoiceDate).toDate();
                $scope.eInvoices[i].RecCreated = new moment.unix($scope.eInvoices[i].RecCreated).toDate();
                $scope.eInvoices[i].RecModified = new moment.unix($scope.eInvoices[i].RecModified).toDate();
            }
            $scope.eInvoicesDisplay = [].concat($scope.eInvoices);
            $scope.isLoading = false;
            $scope.TotalRows = response.TotalRows;
            $scope.Selection = [];
            $scope.FilteredInvoices = [];
        };

        $scope.eInvoicesInquiryError = function (response, status) {
            $scope.isLoading = false;
            alertsService.RenderErrorMessage(response.Error);
        }

        $scope.createInvoiceObject = function () {
            var eInvoicesInquiry = new Object();

            eInvoicesInquiry.SearchNumberForm = $scope.SearchNumberForm;
            eInvoicesInquiry.SearchSymbol =  $scope.SearchSymbol;
            eInvoicesInquiry.SearchFromDate =  ($scope.SearchFromDate != null) ? new moment($scope.SearchFromDate).format('YYYY-MM-DD') : "";
            eInvoicesInquiry.SearchToDate = ($scope.SearchToDate != null) ? new moment($scope.SearchToDate).format('YYYY-MM-DD') : "";
            eInvoicesInquiry.SearchCustomer = $scope.SearchCustomer;
            eInvoicesInquiry.SearchStatus = $scope.SearchStatus;

            eInvoicesInquiry.SortExpression = $scope.SortExpression;
            eInvoicesInquiry.SortDirection = $scope.SortDirection;
            eInvoicesInquiry.FetchSize = $scope.FetchSize;

            return eInvoicesInquiry;
        }

        $scope.createDeleteInvoiceObject = function() {
            var deleteInvoices = new Object();
            deleteInvoices.ID = $scope.Selection.join(",");
            return deleteInvoices;
        }

        $scope.edit = function (_index, _invoice) {
            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                backdrop: 'static', //disables modal closing by click on the backdrop
                size:'lg',
                windowClass: 'my-modal-fullscreen', //set style in .my-modal-fullscreen .modal-lg {} in site.css
                templateUrl: 'app/eInvoice/invoiceMaintenance.html',
                controller: 'eInvoiceMaintenanceController',
                resolve: {
                    editInvoice: function() {
                        var __invoice = $.extend({}, _invoice);
                        return __invoice;
                    }
                }
            });
            modalInstance.rendered.then(function(result) {
                $('.modal .modal-body').css('overflow-y', 'auto');
                $('.modal .modal-body').css('max-height', $(window).height() * 0.8);
                $('.modal .modal-body').css('height', $(window).height() * 0.8);
                $('.modal .modal-body').css('margin-right', 0);
            });
            modalInstance.result.then(function(_result) {
                var _invoice = _result.EditInvoice;
                $scope.selectViewReport = _result.selectViewReport;
                $scope.selectSendDocument = _result.selectSendDocument;

                if($scope.selectViewReport) {
                    $scope.viewReport(_index, _invoice);
                } else if ($scope.selectSendDocument) {
                    $scope.sendDocument(_index, _invoice);
                } else {
                    if (!angular.isUndefinedOrNull(_index)) { //edit
                        angular.copy(_invoice, $scope.eInvoicesDisplay[_index]);
                    } else { //add
                        $scope.eInvoices.push(_invoice);
                        $scope.eInvoicesDisplay.push(_invoice);
                        $scope.selectedRow = _invoice; 
                    }
                }
            }, function(_result) {
                //dismissed 
            })['finally'](function() {
                modalInstance = undefined;
            });    
        };

        $scope.viewReport = function(_index, _invoice) {
            var modalViewReportInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                backdrop: 'static', //disables modal closing by click on the backdrop
                size:'lg',
                templateUrl: 'app/eInvoice/invoiceViewReport.html',
                controller: 'eInvoiceViewReportController',
                resolve: {
                    editInvoice: function() {
                        var __invoice = $.extend({}, _invoice);
                        return __invoice;
                    }
                }
            });
            modalViewReportInstance.rendered.then(function(result) {
                $('.modal .modal-body').css('overflow-y', 'auto');
                $('.modal .modal-body').css('max-height', $(window).height() * 0.7);
                $('.modal .modal-body').css('height', $(window).height() * 0.7);
                $('.modal .modal-body').css('margin-right', 0);
            });
            modalViewReportInstance.result.then(function(_result) { //close
                $scope.edit(_index, _result.EditInvoice);
            }, function() { //dismiss
                $scope.edit(_index, modalViewReportInstance.result.EditInvoice);
            })['finally'](function() {
                modalViewReportInstance = undefined;
                $scope.selectViewReport = false;
            });
        };

        $scope.tableChange = function(tableState){
            if (!$scope.isLoading && tableState.sort) {
                $scope.SortExpression = tableState.sort.predicate;
                $scope.SortDirection = tableState.sort.reverse ? "DESC":"ASC";   
            }
        }

        $scope.sendDocument = function (_index, _invoice) {
            var modalSendDocumentInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                backdrop: 'static', //disables modal closing by click on the backdrop
                //size:'lg',
                templateUrl: 'app/eInvoice/invoiceSend.html',
                controller: 'eInvoiceSendController',
                resolve: {
                    editInvoice: function() {
                        var __invoice = $.extend({}, _invoice);
                        return __invoice;
                    }
                }
            });
            modalSendDocumentInstance.rendered.then(function(result) {
                $('.modal .modal-body').css('overflow-y', 'auto');
                $('.modal .modal-body').css('margin-right', 0);
            });
            modalSendDocumentInstance.result.then(function(_result) { //close
                $scope.edit(_index, _result.EditInvoice);
            }, function() { //dismiss
                $scope.edit(_index, modalSendDocumentInstance.result.EditInvoice);
            })['finally'](function() {
                modalSendDocumentInstance = undefined;
                $scope.selectSendDocument = false;
            });
        }
    };

    eInvoicesController.$inject = injectParams;
    angularAMD.controller('eInvoicesController', eInvoicesController);
});
