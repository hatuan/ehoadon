/**
 * Created by tuanha-01 on 5/13/2016.
 */
"use strict";

define(['angularAMD', 'jquery', 'ajaxService', 'alertsService', 'myApp.Search', 'eInvoiceCustomerService', 'app/eInvoice/customerMaintenanceController'], function (angularAMD, $) {
    var injectParams = ['$scope', '$rootScope', '$state', '$window', 'moment', '$uibModal', 'alertsService', 'Constants', 'eInvoiceCustomerService'];

    var einvoiceCustomersController = function ($scope, $rootScope, $state, $window, moment, $uibModal, alertsService, Constants, eInvoiceCustomerService) {

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

        $scope.delete = function () {
            if($scope.Selection.length <= 0)
                return;
            var deleteEInvoiceCustomers = $scope.createDeleteCustomerObject()
            eInvoiceCustomerService.deleteCustomer(deleteEInvoiceCustomers, 
                function (response, status) {
                    $scope.getCustomers();
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

        $scope.getCustomers = function (searchSqlCondition) {
            if(!angular.isUndefinedOrNull(searchSqlCondition))
                $scope.Search = searchSqlCondition;
            var eInvoiceCustomerInquiry = $scope.createCustomerObject();
            eInvoiceCustomerService.getCustomers(eInvoiceCustomerInquiry, $scope.einvoiceCustomersInquiryCompleted, $scope.einvoiceCustomersInquiryError);
        };

        $scope.einvoiceCustomersInquiryCompleted = function (response, status) {
            alertsService.RenderSuccessMessage(response.ReturnMessage);
            $scope.eInvoiceCustomers = response.Data.eInvoiceCustomers;
            $scope.TotalRows = response.TotalRows;
            $scope.Selection = [];
            $scope.FilteredItems = [];
        };

        $scope.einvoiceCustomersInquiryError = function (response, status) {
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

        $scope.edit = function (_customer) {
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
                
            }, function() {
                //dismissed 
            })['finally'](function() {
                modalInstance = undefined;
            });    
        };
    };

    einvoiceCustomersController.$inject = injectParams;
    angularAMD.controller('eInvoiceCustomersController', einvoiceCustomersController);
});
