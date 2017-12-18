/**
 * Created by tuanha-01 on 5/13/2016.
 */
"use strict";

define(['angularAMD', 'jquery', 'ajaxService', 'alertsService', 'myApp.Search', 'eInvoiceItemService', 'app/eInvoice/itemMaintenanceController'], function (angularAMD, $) {
    var injectParams = ['$scope', '$rootScope', '$state', '$window', 'moment', '$uibModal', 'alertsService', 'Constants', 'eInvoiceItemService'];

    var einvoiceItemsController = function ($scope, $rootScope, $state, $window, moment, $uibModal, alertsService, Constants, eInvoiceItemService) {

        $scope.initializeController = function () {
            $rootScope.applicationModule = "eInvoiceItems";
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
                ID: "ehd_item.code",
                Name: "Code",
                Type: "CODE", //CODE, FREE, DATE
                ValueIn: "eInvoiceItems",
                Value: ""
            },
            {
                ID: "ehd_item.description",
                Name: "Description",
                Type: "FREE", //CODE, FREE, DATE
                ValueIn: "",
                Value: ""
            });

            $scope.eInvoiceItems = [];
            $scope.FilteredItems = [];
            $scope.getItems();
        };

        $scope.refresh = function () {
            $scope.getItems();
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
            var deleteEInvoiceItems = $scope.createDeleteItemObject()
            eInvoiceItemService.deleteItem(deleteEInvoiceItems, 
                function (response, status) {
                    $scope.getItems();
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

        $scope.getItems = function (searchSqlCondition) {
            if(!angular.isUndefinedOrNull(searchSqlCondition))
                $scope.Search = searchSqlCondition;
            var eInvoiceItemInquiry = $scope.createItemObject();
            eInvoiceItemService.getItems(eInvoiceItemInquiry, $scope.einvoiceItemsInquiryCompleted, $scope.einvoiceItemsInquiryError);
        };

        $scope.einvoiceItemsInquiryCompleted = function (response, status) {
            alertsService.RenderSuccessMessage(response.ReturnMessage);
            $scope.eInvoiceItems = response.Data.eInvoiceItems;
            $scope.TotalRows = response.TotalRows;
            $scope.Selection = [];
            $scope.FilteredItems = [];
        };

        $scope.einvoiceItemsInquiryError = function (response, status) {
            alertsService.RenderErrorMessage(response.Error);
        }

        $scope.createItemObject = function () {
            var eInvoiceItemInquiry = new Object();

            eInvoiceItemInquiry.Search = $scope.Search;
            eInvoiceItemInquiry.SortExpression = $scope.SortExpression;
            eInvoiceItemInquiry.SortDirection = $scope.SortDirection;
            eInvoiceItemInquiry.FetchSize = $scope.FetchSize;

            return eInvoiceItemInquiry;
        }

        $scope.createDeleteItemObject = function() {
            var deleteItems = new Object();
            deleteItems.ID = $scope.Selection.join(",");
            return deleteItems;
        }

        $scope.edit = function (_item) {
            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                //size:'lg',
                templateUrl: 'app/eInvoice/itemMaintenance.html',
                controller: 'eInvoiceItemMaintenanceController',
                resolve: {
                    editItem: function() {
                        var __item = $.extend({}, _item);
                        return __item;
                    }
                }
            });
            modalInstance.rendered.then(function(result) {
                $('.modal .modal-body').css('overflow-y', 'auto');
                //$('.modal .modal-body').css('max-height', $(window).height() * 0.7);
                //$('.modal .modal-body').css('height', $(window).height() * 0.7);
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

    einvoiceItemsController.$inject = injectParams;
    angularAMD.controller('eInvoiceItemsController', einvoiceItemsController);
});