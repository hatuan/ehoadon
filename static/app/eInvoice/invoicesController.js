/**
 * Created by tuanha-01 on 5/13/2016.
 */
"use strict";

define(['angularAMD', 'jquery', 'ajaxService', 'alertsService', 'select2', 'myApp.Search', 'eInvoiceService', 'digitalsignature', 'reportjs-report', 'reportjs-viewer', 'app/eInvoice/invoiceMaintenanceController', 'app/eInvoice/invoiceViewReportController'], function (angularAMD, $) {
    var injectParams = ['$scope', '$rootScope', '$state', '$window', 'moment', '$uibModal', 'alertsService', 'Constants', 'eInvoiceService'];

    var eInvoicesController = function ($scope, $rootScope, $state, $window, moment, $uibModal, alertsService, Constants, eInvoiceService) {

        $scope.initializeController = function () {
            $rootScope.applicationModule = "eInvoices";
            $rootScope.alerts = [];
            
            $scope.Constants = Constants;

            $scope.Search = "";
            $scope.isSearched = false;
            $scope.SortExpression = "rec_created_at";
            $scope.SortDirection = "DESC";
            $scope.FetchSize = 100;
            $scope.CurrentPage = 1;
            $scope.PageSize = 9;
            $scope.TotalRows = 0;
            $scope.Selection=[];

            $scope.searchConditionObjects = [];
            /*
            $scope.searchConditionObjects.push({
                ID: "ehd_form_type.code",
                Name: "Code",
                Type: "CODE", //CODE, FREE, DATE
                ValueIn: "eInvoices",
                Value: ""
            },
            {
                ID: "ehd_form_type.description",
                Name: "Description",
                Type: "FREE", //CODE, FREE, DATE
                ValueIn: "",
                Value: ""
            });
            */
            $scope.eInvoices = [];
            $scope.FilteredInvoices = [];
            $scope.selectViewReport = false;
            $scope.getInvoices();
        };

        $scope.refresh = function () {
            $scope.getInvoices();
        }

        $scope.showSearch = function () {
            $scope.isSearched = !$scope.isSearched;
        }

        $scope.selectAll = function () {
            $scope.Selection=[];
            for(var i = 0; i < $scope.FilteredInvoices.length; i++) {
                $scope.Selection.push($scope.FilteredInvoices[i]["ID"]);
            }
        }

        $scope.delete = function () {
            if($scope.Selection.length <= 0)
                return;
            var deleteEInvoiceInvoices = $scope.createDeleteInvoiceObject()
            eInvoiceService.deleteInvoice(deleteEInvoiceInvoices, 
                function (response, status) {
                    $scope.getInvoices();
                }, 
                function (response, status){
                    alertsService.RenderErrorMessage(response.Error);
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

        $scope.getInvoices = function (searchSqlCondition) {
            if(!angular.isUndefinedOrNull(searchSqlCondition))
                $scope.Search = searchSqlCondition;
            var eInvoicesInquiry = $scope.createInvoiceObject();
            eInvoiceService.getInvoices(eInvoicesInquiry, $scope.eInvoicesInquiryCompleted, $scope.eInvoicesInquiryError);
        };

        $scope.eInvoicesInquiryCompleted = function (response, status) {
            alertsService.RenderSuccessMessage(response.ReturnMessage);
            $scope.eInvoices = response.Data.eInvoices;
            for (var i = 0, len = $scope.eInvoices.length; i < len; i++) {
                $scope.eInvoices[i].RecCreated = new moment.unix($scope.eInvoices[i].RecCreated).toDate();
                $scope.eInvoices[i].RecModified = new moment.unix($scope.eInvoices[i].RecModified).toDate();
            }
            $scope.TotalRows = response.TotalRows;
            $scope.Selection = [];
            $scope.FilteredInvoices = [];
        };

        $scope.eInvoicesInquiryError = function (response, status) {
            alertsService.RenderErrorMessage(response.Error);
        }

        $scope.createInvoiceObject = function () {
            var eInvoicesInquiry = new Object();

            eInvoicesInquiry.Search = $scope.Search;
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

        $scope.edit = function (_invoice) {
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

                if($scope.selectViewReport) {
                    $scope.viewReport(_invoice);
                }
            }, function(_result) {
                //dismissed 
            })['finally'](function() {
                modalInstance = undefined;
            });    
        };

        $scope.viewReport = function(_invoice) {
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
                $scope.edit(_result.EditInvoice);
            }, function() { //dismiss
                $scope.edit(modalViewReportInstance.result.EditInvoice);
            })['finally'](function() {
                modalViewReportInstance = undefined;
                $scope.selectViewReport = false;
            });
        };
    };

    eInvoicesController.$inject = injectParams;
    angularAMD.controller('eInvoicesController', eInvoicesController);
});
