/**
 * Created by tuanha-01 on 5/13/2016.
 */
"use strict";

define(['angularAMD', 'jquery', 'ajaxService', 'alertsService', 'myApp.Search', 'eInvoiceCustomerService', 'app/eInvoice/customerMaintenanceController'], function (angularAMD, $) {
    var injectParams = ['$scope', '$rootScope', '$state', '$window', 'moment', '$uibModal', '$confirm', 'alertsService', 'Constants', 'eInvoiceCustomerService'];

    var einvoiceCustomersController = function ($scope, $rootScope, $state, $window, moment, $uibModal, $confirm, alertsService, Constants, eInvoiceCustomerService) {

        $scope.initializeController = function () {
            $rootScope.applicationModule = "eInvoiceCustomers";
            $rootScope.alerts = [];
            
            $scope.Constants = Constants;

            $scope.Search = "";
            $scope.isSearched = false;
            $scope.SortExpression = "Code";
            $scope.SortDirection = "ASC";
            $scope.FetchSize = 100;
            $scope.CurrentPage = 1;
            $scope.PageSize = 9;
            $scope.TotalRows = 0;
            $scope.Selection=[];

            $scope.searchConditionObjects = [];
            $scope.searchConditionObjects.push({
                ID: "ehd_customer.code",
                Name: "Code",
                Type: "CODE", //CODE, FREE, DATE
                ValueIn: "eInvoiceCustomers",
                Value: ""
            },
            {
                ID: "ehd_customer.description",
                Name: "Description",
                Type: "FREE", //CODE, FREE, DATE
                ValueIn: "",
                Value: ""
            });

            $scope.eInvoiceCustomers = [];
            $scope.eInvoiceCustomersDisplay = [];
            $scope.selectedRow = null;
            $scope.isLoading = true;
            $scope.FilteredItems = [];
            $scope.getCustomers();
        };

        $scope.refresh = function () {
            $scope.getCustomers();
        }

        $scope.showSearch = function () {
            $scope.isSearched = !$scope.isSearched;
        }

        $scope.selectAll = function () {
            $scope.Selection=[];
            for(var i = 0; i < $scope.FilteredItems.length; i++) {
                $scope.Selection.push($scope.FilteredItems[i]["ID"]);
            }
        }

        $scope.delete = function (_index, _item) {
            $confirm({text: 'Are you sure you want to delete?', title: 'Delete', ok: 'Yes', cancel: 'No'})
            .then(function() {
                $scope.Selection = [];
                $scope.Selection.push(_item["ID"]);
                var deleteEInvoiceCustomers = $scope.createDeleteItemObject()
                eInvoiceCustomerService.deleteItem(deleteEInvoiceCustomers, 
                    function (response, status) {
                        $scope.Selection = [];
                        $scope.eInvoiceCustomers.splice($scope.eInvoiceCustomers.indexOf(_item), 1);
                        $scope.eInvoiceCustomersDisplay.splice($scope.eInvoiceCustomersDisplay.indexOf(_item), 1);
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

        $scope.getCustomers = function (searchSqlCondition) {
            if(!angular.isUndefinedOrNull(searchSqlCondition))
                $scope.Search = searchSqlCondition;
            var eInvoiceCustomerInquiry = $scope.createCustomerObject();
            eInvoiceCustomerService.getCustomers(eInvoiceCustomerInquiry, $scope.einvoiceCustomersInquiryCompleted, $scope.einvoiceCustomersInquiryError);
        };

        $scope.einvoiceCustomersInquiryCompleted = function (response, status) {
            alertsService.RenderSuccessMessage(response.ReturnMessage);
            $scope.eInvoiceCustomers = response.Data.eInvoiceCustomers;
            $scope.eInvoiceCustomersDisplay = response.Data.eInvoiceCustomers;
            $scope.isLoading = false;
            $scope.TotalRows = response.TotalRows;
            $scope.Selection = [];
            $scope.FilteredItems = [];
        };

        $scope.einvoiceCustomersInquiryError = function (response, status) {
            $scope.isLoading = false;
            alertsService.RenderErrorMessage(response.Error);
        }

        $scope.createCustomerObject = function () {
            var eInvoiceCustomerInquiry = new Object();

            eInvoiceCustomerInquiry.Search = $scope.Search;
            eInvoiceCustomerInquiry.SortExpression = $scope.SortExpression;
            eInvoiceCustomerInquiry.SortDirection = $scope.SortDirection;
            eInvoiceCustomerInquiry.FetchSize = $scope.FetchSize;

            return eInvoiceCustomerInquiry;
        }

        $scope.createDeleteCustomerObject = function() {
            var deleteCustomers = new Object();
            deleteCustomers.ID = $scope.Selection.join(",");
            return deleteCustomers;
        }

        $scope.edit = function (_index, _customer) {
            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                //size:'lg',
                templateUrl: 'app/eInvoice/customerMaintenance.html',
                controller: 'eInvoiceCustomerMaintenanceController',
                resolve: {
                    editCustomer: function() {
                        var __customer = $.extend({}, _customer);
                        return __customer;
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
                if (_customer) { //edit
                    angular.copy(_result.EditCustomer, $scope.eInvoiceCustomersDisplay[_index]);
                } else { //add
                    $scope.eInvoiceCustomers.push(_result.EditCustomer);
                    $scope.eInvoiceCustomersDisplay.push(_result.EditCustomer);
                    $scope.selectedRow = _result.EditItemUom; 
                }
            }, function() {
                //dismissed 
            })['finally'](function() {
                modalInstance = undefined;
            });    
        };

        $scope.tableChange = function(tableState){
            if (!$scope.isLoading && tableState.sort) {
                $scope.SortExpression = tableState.sort.predicate;
                $scope.SortDirection = tableState.sort.reverse ? "DESC":"ASC";   
            }
        }
    };

    einvoiceCustomersController.$inject = injectParams;
    angularAMD.controller('eInvoiceCustomersController', einvoiceCustomersController);
});
