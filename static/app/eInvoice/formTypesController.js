/**
 * Created by tuanha-01 on 5/13/2016.
 */
"use strict";

define(['angularAMD', 'jquery', 'ajaxService', 'alertsService', 'myApp.Search', 'eInvoiceFormTypeService', 'app/eInvoice/formTypeMaintenanceController', 'app/eInvoice/formTypeReportsController', 'app/eInvoice/formTypeViewReportController'], function (angularAMD, $) {
    var injectParams = ['$scope', '$rootScope', '$state', '$window', 'moment', '$uibModal', 'alertsService', 'Constants', 'eInvoiceFormTypeService'];

    var einvoiceFormTypesController = function ($scope, $rootScope, $state, $window, moment, $uibModal, alertsService, Constants, eInvoiceFormTypeService) {

        $scope.initializeController = function () {
            $rootScope.applicationModule = "eInvoiceFormTypes";
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
                ValueIn: "eInvoiceFormTypes",
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
            $scope.eInvoiceFormTypes = [];
            $scope.FilteredFormTypes = [];
            $scope.selectReports = false;
            $scope.getFormTypes();
        };

        $scope.refresh = function () {
            $scope.getFormTypes();
        }

        $scope.showSearch = function () {
            $scope.isSearched = !$scope.isSearched;
        }

        $scope.selectAll = function () {
            $scope.Selection=[];
            for(var i = 0; i < $scope.FilteredFormTypes.length; i++) {
                $scope.Selection.push($scope.FilteredFormTypes[i]["ID"]);
            }
        }

        $scope.delete = function () {
            if($scope.Selection.length <= 0)
                return;
            var deleteEInvoiceFormTypes = $scope.createDeleteFormTypeObject()
            eInvoiceFormTypeService.deleteFormType(deleteEInvoiceFormTypes, 
                function (response, status) {
                    $scope.getFormTypes();
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

        $scope.getFormTypes = function (searchSqlCondition) {
            if(!angular.isUndefinedOrNull(searchSqlCondition))
                $scope.Search = searchSqlCondition;
            var eInvoiceFormTypeInquiry = $scope.createFormTypeObject();
            eInvoiceFormTypeService.getFormTypes(eInvoiceFormTypeInquiry, $scope.einvoiceFormTypesInquiryCompleted, $scope.einvoiceFormTypesInquiryError);
        };

        $scope.einvoiceFormTypesInquiryCompleted = function (response, status) {
            alertsService.RenderSuccessMessage(response.ReturnMessage);
            $scope.eInvoiceFormTypes = response.Data.eInvoiceFormTypes;
            for (var i = 0, len = $scope.eInvoiceFormTypes.length; i < len; i++) {
                $scope.eInvoiceFormTypes[i].RecCreated = new moment.unix($scope.eInvoiceFormTypes[i].RecCreated).toDate();
                $scope.eInvoiceFormTypes[i].RecModified = new moment.unix($scope.eInvoiceFormTypes[i].RecModified).toDate();
            }
            $scope.TotalRows = response.TotalRows;
            $scope.Selection = [];
            $scope.FilteredFormTypes = [];
        };

        $scope.einvoiceFormTypesInquiryError = function (response, status) {
            alertsService.RenderErrorMessage(response.Error);
        }

        $scope.createFormTypeObject = function () {
            var eInvoiceFormTypeInquiry = new Object();

            eInvoiceFormTypeInquiry.Search = $scope.Search;
            eInvoiceFormTypeInquiry.SortExpression = $scope.SortExpression;
            eInvoiceFormTypeInquiry.SortDirection = $scope.SortDirection;
            eInvoiceFormTypeInquiry.FetchSize = $scope.FetchSize;

            return eInvoiceFormTypeInquiry;
        }

        $scope.createDeleteFormTypeObject = function() {
            var deleteFormTypes = new Object();
            deleteFormTypes.ID = $scope.Selection.join(",");
            return deleteFormTypes;
        }

        $scope.edit = function (_formType) {
            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                size:'lg',
                templateUrl: 'app/eInvoice/formTypeMaintenance.html',
                controller: 'eInvoiceFormTypeMaintenanceController',
                resolve: {
                    editFormType: function() {
                        var __formType = $.extend({}, _formType);
                        return __formType;
                    }
                }
            });
            modalInstance.rendered.then(function(result) {
                $('.modal .modal-body').css('overflow-y', 'auto');
                $('.modal .modal-body').css('max-height', $(window).height() * 0.7);
                $('.modal .modal-body').css('height', $(window).height() * 0.7);
                $('.modal .modal-body').css('margin-right', 0);
            });
            modalInstance.result.then(function(_result) {

                _formType = _result.EditFormType;
                $scope.selectReports = _result.SelectReports;

                if($scope.selectReports) {
                    $scope.showSelectReports(_formType);
                }

            }, function(_result) {
                //dismissed 
            })['finally'](function() {
                modalInstance = undefined;
            });    
        };

        $scope.showSelectReports = function(_formType) {
            var modalSelectReportInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                size:'lg',
                templateUrl: 'app/eInvoice/formTypeReports.html',
                controller: 'eInvoiceFormTypeReportsController',
                resolve: {
                    editFormType: function() {
                        var __formType = $.extend({}, _formType);
                        return __formType;
                    }
                }
            });
            modalSelectReportInstance.rendered.then(function(result) {
                $('.modal .modal-body').css('overflow-y', 'auto');
                $('.modal .modal-body').css('max-height', $(window).height() * 0.7);
                $('.modal .modal-body').css('height', $(window).height() * 0.7);
                $('.modal .modal-body').css('margin-right', 0);
            });
            modalSelectReportInstance.result.then(function(_result) {
                $scope.edit(_result.EditFormType);
            }, function(_result) { //dismiss
                $scope.edit(_result.EditFormType);
            })['finally'](function() {
                modalSelectReportInstance = undefined;
                $scope.selectReports = false;
            });
        };
        
        $scope.viewReport = function(_formType) {
            var modalViewReportInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                size:'lg',
                templateUrl: 'app/eInvoice/formTypeViewReport.html',
                controller: 'eInvoiceFormTypeViewReportController',
                resolve: {
                    editFormType: function() {
                        var __formType = $.extend({}, _formType);
                        return __formType;
                    }
                }
            });
            modalViewReportInstance.rendered.then(function(result) {
                $('.modal .modal-body').css('overflow-y', 'auto');
                $('.modal .modal-body').css('max-height', $(window).height() * 0.7);
                $('.modal .modal-body').css('height', $(window).height() * 0.7);
                $('.modal .modal-body').css('margin-right', 0);
            });
            modalViewReportInstance.result.then(function(_result) {
            }, function(_result) { //dismiss
            })['finally'](function() {
                modalViewReportInstance = undefined;
            });
        };
    };

    einvoiceFormTypesController.$inject = injectParams;
    angularAMD.controller('eInvoiceFormTypesController', einvoiceFormTypesController);
});
