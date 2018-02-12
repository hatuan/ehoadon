/**
 * Created by tuanha-01 on 5/13/2016.
 */
"use strict";

define(['angularAMD', 'jquery', 'ajaxService', 'alertsService', 'myApp.Search', 'eInvoiceItemUomService', 'app/eInvoice/itemUomMaintenanceController'], function (angularAMD, $) {
    var injectParams = ['$scope', '$rootScope', '$state', '$window', 'moment', '$uibModal', '$confirm', 'alertsService', 'Constants', 'eInvoiceItemUomService'];

    var einvoiceItemUomsController = function ($scope, $rootScope, $state, $window, moment, $uibModal, $confirm, alertsService, Constants, eInvoiceItemUomService) {

        $scope.initializeController = function () {
            $rootScope.applicationModule = "eInvoiceItemUoms";
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
                ID: "ehd_item_uom.code",
                Name: "Code",
                Type: "CODE", //CODE, FREE, DATE
                ValueIn: "eInvoiceItemUoms",
                Value: ""
            },
            {
                ID: "ehd_item_uom.description",
                Name: "Description",
                Type: "FREE", //CODE, FREE, DATE
                ValueIn: "",
                Value: ""
            });

            $scope.eInvoiceItemUoms = [];
            $scope.eInvoiceItemUomsSafe = [];
            $scope.selectedRow = null;
            $scope.FilteredItems = [];
            $scope.isLoading = true;
            $scope.getItemUoms();
        };

        $scope.refresh = function () {
            $scope.getItemUoms();
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
                $scope.Selection.push(_item["ID"]);
                var deleteEInvoiceItems = $scope.createDeleteItemUomObject()
                eInvoiceItemUomService.deleteItemUom(deleteEInvoiceItems, 
                    function (response, status) {
                        $scope.Selection = [];
                        //$scope.getItemUoms();
                        $scope.eInvoiceItemUoms.splice($scope.eInvoiceItemUoms.indexOf(_item), 1);
                        $scope.eInvoiceItemUomsSafe.splice($scope.eInvoiceItemUomsSafe.indexOf(_item), 1);
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

        $scope.getItemUoms = function (searchSqlCondition) {
            if(!angular.isUndefinedOrNull(searchSqlCondition))
                $scope.Search = searchSqlCondition;
            var eInvoiceItemUomInquiry = $scope.createItemUomObject();
            eInvoiceItemUomService.getItemUoms(eInvoiceItemUomInquiry, $scope.einvoiceItemUomsInquiryCompleted, $scope.einvoiceItemUomsInquiryError);
        };

        $scope.einvoiceItemUomsInquiryCompleted = function (response, status) {
            alertsService.RenderSuccessMessage(response.ReturnMessage);
            $scope.eInvoiceItemUoms = response.Data.eInvoiceItemUoms;
            $scope.TotalRows = response.TotalRows;
            $scope.Selection = [];
            $scope.FilteredItems = [];
            $scope.eInvoiceItemUomsSafe = response.Data.eInvoiceItemUoms;
            $scope.isLoading = false;
        };

        $scope.einvoiceItemUomsInquiryError = function (response, status) {
            $scope.isLoading = false;
            alertsService.RenderErrorMessage(response.Error);
        }

        $scope.createItemUomObject = function () {
            var eInvoiceItemUomInquiry = new Object();

            eInvoiceItemUomInquiry.Search = $scope.Search;
            eInvoiceItemUomInquiry.SortExpression = $scope.SortExpression;
            eInvoiceItemUomInquiry.SortDirection = $scope.SortDirection;
            eInvoiceItemUomInquiry.FetchSize = $scope.FetchSize;

            return eInvoiceItemUomInquiry;
        }

        $scope.createDeleteItemUomObject = function() {
            var deleteItemUoms = new Object();
            deleteItemUoms.ID = $scope.Selection.join(",");
            return deleteItemUoms;
        }

        $scope.edit = function (_index, _itemUom) {
            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                //size:'lg',
                templateUrl: 'app/eInvoice/itemUomMaintenance.html',
                controller: 'eInvoiceItemUomMaintenanceController',
                resolve: {
                    editItemUom: function() {
                        var __itemUom = $.extend({}, _itemUom);
                        return __itemUom;
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
                if (_itemUom) { //edit
                    angular.copy(_result.EditItemUom, $scope.eInvoiceItemUoms[_index]);
                    //var _indexSafe = $scope.eInvoiceItemUomsSafe.indexOf(_itemUom);
                    //angular.copy(_result.EditItemUom, $scope.eInvoiceItemUomsSafe[_indexSafe]);
                } else { //add
                    $scope.eInvoiceItemUoms.push(_result.EditItemUom);
                    $scope.eInvoiceItemUomsSafe.push(_result.EditItemUom);

                    $scope.selectedRow = _result.EditItemUom;
                }
            }, function() {
                //dismissed 
            })['finally'](function() {
                modalInstance = undefined;
            });    
        };

        $scope.tableChange = function(tableState){
            if ( !$scope.isLoading && tableState.sort) {
                $scope.SortExpression = tableState.sort.predicate;
                $scope.SortDirection = tableState.sort.reverse ? "DESC":"ASC";   
            }
        }
    };

    einvoiceItemUomsController.$inject = injectParams;
    angularAMD.controller('eInvoiceItemUomsController', einvoiceItemUomsController);
});
