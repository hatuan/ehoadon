/**
 * Created by tuanha-01 on 5/13/2016.
 */
"use strict";

define(['angularAMD', 'jquery', 'ajaxService', 'alertsService', 'eInvoiceItemService'], function(angularAMD, $) {
    var injectParams = ['$scope', '$rootScope', '$state', '$window', 'moment', '$uibModal', '$uibModalInstance', 'alertsService', 'eInvoiceItemService', '$stateParams', '$confirm', 'Constants', 'editItem'];

    var itemMaintenanceController = function($scope, $rootScope, $state, $window, moment, $uibModal, $uibModalInstance, alertsService, eInvoiceItemService, $stateParams, $confirm, Constants, editItem) {
        $scope.Constants = Constants;
        $scope.EditItem = editItem;

        if($scope.EditItem.ID == null) {
            $scope.EditItem.Code = "";
            $scope.EditItem.Description = "";
            
            $scope.EditItem.Status = $scope.Constants.Status[1].Code;
            $scope.EditItem.RecCreatedByID = $rootScope.currentUser.ID;
            $scope.EditItem.RecCreatedByUser = $rootScope.currentUser.Name;
            $scope.EditItem.RecCreated = new Date();
            $scope.EditItem.RecModifiedByID = $rootScope.currentUser.ID;
            $scope.EditItem.RecModifiedByUser = $rootScope.currentUser.Name;
            $scope.EditItem.RecModified = new Date();
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
                            Table: "ehd_item",
                            RecID: function() {
                                return $scope.EditItem.ID
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
                var _postItem = new Object();

                if(editItem.ID == null) {
                    $scope.EditItem.RecCreatedByID = $rootScope.currentUser.ID;
                    $scope.EditItem.RecCreated = new Date();
                    $scope.EditItem.RecModifiedByID = $rootScope.currentUser.ID;
                    $scope.EditItem.RecModified = new Date();

                    _postItem = $scope.EditItem;
                    _postItem.RecCreated = new moment($scope.EditItem.RecCreated).unix();
                    _postItem.RecModified = new moment($scope.EditItem.RecModified).unix();
                } else {
                    $scope.EditItem.RecModifiedByID = $rootScope.currentUser.ID;
                    $scope.EditItem.RecModified = new Date();

                    _postItem = $scope.EditItem;
                    _postItem.RecModifiedByID = $rootScope.currentUser.ID;
                    _postItem.RecModified = new moment($scope.EditItem.RecModified).unix();
                }
                eInvoiceItemService.updateItem(_postItem, $scope.itemUpdateCompleted, $scope.itemUpdateError)
            }
        };
        
        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.itemUpdateCompleted = function() {
            var _result = new Object();
            _result.EditItem = $scope.EditItem;
            $uibModalInstance.close(_result);
        };

        $scope.itemUpdateError = function() {
            alertsService.RenderErrorMessage(response.Error);
        }
    };

    itemMaintenanceController.$inject = injectParams;
    angularAMD.controller('eInvoiceItemMaintenanceController', itemMaintenanceController);
});