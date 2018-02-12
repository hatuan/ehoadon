/**
 * Created by tuanha-01 on 5/13/2016.
 */
"use strict";

define(['angularAMD', 'jquery', 'ajaxService', 'alertsService', 'eInvoiceItemUomService'], function(angularAMD, $) {
    var injectParams = ['$scope', '$rootScope', '$state', '$window', 'moment', '$uibModal', '$uibModalInstance', 'alertsService', 'eInvoiceItemUomService', '$stateParams', '$confirm', 'Constants', 'editItemUom'];

    var itemUomMaintenanceController = function($scope, $rootScope, $state, $window, moment, $uibModal, $uibModalInstance, alertsService, eInvoiceItemUomService, $stateParams, $confirm, Constants, editItemUom) {
        $scope.Constants = Constants;
        $scope.EditItemUom = editItemUom;

        if($scope.EditItemUom.ID == null) {
            $scope.EditItemUom.Code = "";
            $scope.EditItemUom.Description = "";
            
            $scope.EditItemUom.Status = $scope.Constants.Status[1].Code;
            $scope.EditItemUom.RecCreatedByID = $rootScope.currentUser.ID;
            $scope.EditItemUom.RecCreatedByUser = $rootScope.currentUser.Name;
            $scope.EditItemUom.RecCreated = new Date();
            $scope.EditItemUom.RecModifiedByID = $rootScope.currentUser.ID;
            $scope.EditItemUom.RecModifiedByUser = $rootScope.currentUser.Name;
            $scope.EditItemUom.RecModified = new Date();
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
                            Table: "ehd_item_uom",
                            RecID: function() {
                                return $scope.EditItemUom.ID
                            }
                        }
                    }
                },
                "Description": {
                    required: true
                }
            }
        };

        $scope.ok = function(form) {
            if (form.validate()) {
                var _postItemUom = new Object();

                if(editItemUom.ID == null) {
                    $scope.EditItemUom.RecCreatedByID = $rootScope.currentUser.ID;
                    $scope.EditItemUom.RecCreated = new Date();
                    $scope.EditItemUom.RecModifiedByID = $rootScope.currentUser.ID;
                    $scope.EditItemUom.RecModified = new Date();

                    _postItemUom = $scope.EditItemUom;
                    _postItemUom.RecCreated = new moment($scope.EditItemUom.RecCreated).unix();
                    _postItemUom.RecModified = new moment($scope.EditItemUom.RecModified).unix();
                } else {
                    $scope.EditItemUom.RecModifiedByID = $rootScope.currentUser.ID;
                    $scope.EditItemUom.RecModified = new Date();

                    _postItemUom = $scope.EditItemUom;
                    _postItemUom.RecModifiedByID = $rootScope.currentUser.ID;
                    _postItemUom.RecModified = new moment($scope.EditItemUom.RecModified).unix();
                }
                eInvoiceItemUomService.updateItemUom(_postItemUom, $scope.itemUomUpdateCompleted, $scope.itemUomUpdateError)
            }
        };
        
        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.itemUomUpdateCompleted = function(response) {
            var _result = {};
            $scope.EditItemUom = response.Data.eInvoiceItemUom;
            _result.EditItemUom = $scope.EditItemUom;
            $uibModalInstance.close(_result);
        };

        $scope.itemUomUpdateError = function(response) {
            alertsService.RenderErrorMessage(response.Error);
        }
    };

    itemUomMaintenanceController.$inject = injectParams;
    angularAMD.controller('eInvoiceItemUomMaintenanceController', itemUomMaintenanceController);
});