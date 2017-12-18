/**
 * Created by tuanha-01 on 5/13/2016.
 */
"use strict";

define(['angularAMD', 'jquery', 'ajaxService', 'alertsService', 'eInvoiceFormReleaseService', 'eInvoiceFormTypeService'], function(angularAMD, $) {
    var injectParams = ['$scope', '$rootScope', '$state', '$filter', 'moment', '$uibModal', '$uibModalInstance', 'ajaxService', 'alertsService', 'eInvoiceFormReleaseService', 'eInvoiceFormTypeService', '$stateParams', '$confirm', 'Constants', 'editFormRelease'];

    var formReleaseMaintenanceController = function($scope, $rootScope, $state, $filter, moment, $uibModal, $uibModalInstance, ajaxService, alertsService, eInvoiceFormReleaseService, eInvoiceFormTypeService, $stateParams, $confirm, Constants, editFormRelease) {
       
        $scope.initializeController = function() {
            $scope.Constants = Constants;
            $scope.EditFormRelease = editFormRelease;
          
            if($scope.EditFormRelease.ID == null) {
                $scope.EditFormRelease.FormTypeID = null;
                $scope.EditFormRelease.FormTypeInvoiceType = '';
                $scope.EditFormRelease.FormTypeNumberForm = '';
                $scope.EditFormRelease.FormTypeSymbol = '';
                $scope.EditFormRelease.ReleaseTotal = 0;
                $scope.EditFormRelease.ReleaseFrom = 0; 
                $scope.EditFormRelease.ReleaseTo = 0;
                $scope.EditFormRelease.ReleaseUsed = 0;
                $scope.EditFormRelease.ReleaseDate = new moment().toDate();
                $scope.EditFormRelease.StartDate = new moment().add(1, 'M').toDate();
                $scope.EditFormRelease.TaxAuthoritiesStatus = "0";

                $scope.EditFormRelease.Status = $scope.Constants.Status[1].Code;
                $scope.EditFormRelease.RecCreatedByID = $rootScope.currentUser.ID;
                $scope.EditFormRelease.RecCreatedByUser = $rootScope.currentUser.Name;
                $scope.EditFormRelease.RecCreated = new Date();
                $scope.EditFormRelease.RecModifiedByID = $rootScope.currentUser.ID;
                $scope.EditFormRelease.RecModifiedByUser = $rootScope.currentUser.Name;
                $scope.EditFormRelease.RecModified = new Date();
            } else {
                
            }

            $scope.getInvoiceForms();
        };

        $scope.$watch(function(scope) {
            return scope.EditFormRelease.ReleaseTotal; 
        }, function(newValue, oldValue) {
            //Update ReleaseFrom, ReleaseTo
            if ($scope.EditFormRelease.FormTypeID == '' || angular.isUndefinedOrNull($scope.EditFormRelease.FormTypeID))
                return;

            var eInvoiceFormReleaseInquiry = new Object();
            eInvoiceFormReleaseInquiry.FormTypeID = $scope.EditFormRelease.FormTypeID;
            eInvoiceFormReleaseService.getFormReleaseByMaxReleaseTo(eInvoiceFormReleaseInquiry,
                function (response, status) { //success
                    var _eInvoiceFormRelease = response.Data.eInvoiceFormRelease;

                    if (angular.isUndefinedOrNull(_eInvoiceFormRelease.ReleaseTo))
                        _eInvoiceFormRelease.ReleaseTo = 0;

                    $scope.EditFormRelease.ReleaseFrom = _eInvoiceFormRelease.ReleaseTo + 1;
                    $scope.EditFormRelease.ReleaseTo = $scope.EditFormRelease.ReleaseFrom + newValue;
                }, 
                function (response, status) { //fail
                    $scope.EditFormRelease.ReleaseFrom = 1;
                    $scope.EditFormRelease.ReleaseTo = $scope.EditFormRelease.ReleaseFrom + newValue;
                });
        });

        $scope.validationOptions = {
            rules: {
                "FormNumber": {
                    required: true
                },
                "ReleaseTotal": {
                    required: true
                },
                "ReleaseFrom": {
                    required: true
                },
                "ReleaseTo": {
                    required: true
                },
            }
        };

        $scope.ok = function(form) {
            if (form.validate()) {
                var _postFormRelease = new Object();

                if($scope.EditFormRelease.ID == null) {
                    $scope.EditFormRelease.RecCreatedByID = $rootScope.currentUser.ID;
                    $scope.EditFormRelease.RecCreated = new Date();
                    $scope.EditFormRelease.RecModifiedByID = $rootScope.currentUser.ID;
                    $scope.EditFormRelease.RecModified = new Date();

                    _postFormRelease = $scope.EditFormRelease;
                    _postFormRelease.RecCreated = new moment($scope.EditFormRelease.RecCreated).unix();
                    _postFormRelease.RecModified = new moment($scope.EditFormRelease.RecModified).unix();
                } else {
                    $scope.EditFormRelease.RecModifiedByID = $rootScope.currentUser.ID;
                    $scope.EditFormRelease.RecModified = new Date();

                    _postFormRelease = $scope.EditFormRelease;
                    _postFormRelease.RecCreated = new moment($scope.EditFormRelease.RecCreated).unix();
                    _postFormRelease.RecModifiedByID = $rootScope.currentUser.ID;
                    _postFormRelease.RecModified = new moment($scope.EditFormRelease.RecModified).unix();
                }
                
                _postFormRelease.ReleaseDate = new moment(_postFormRelease.ReleaseDate).unix();
                _postFormRelease.StartDate = new moment(_postFormRelease.StartDate).unix();
                eInvoiceFormReleaseService.updateFormRelease(_postFormRelease, $scope.formReleaseUpdateCompleted, $scope.formReleaseUpdateError)
            }
        };
        
        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.formReleaseUpdateCompleted = function(response, status) {
            var _result = new Object();
            _result.EditFormRelease = $scope.EditFormRelease;
            $uibModalInstance.close(_result);
        };

        $scope.formReleaseUpdateError = function(response, status) {
            alertsService.RenderErrorMessage(response.Error);
        };

        $scope.getInvoiceForms = function() {
            var eInvoiceFormReleaseInquiry = new Object();

            eInvoiceFormReleaseInquiry.Search = '';
            eInvoiceFormReleaseInquiry.SortExpression = 'rec_created_at';
            eInvoiceFormReleaseInquiry.SortDirection = 'DESC';
            eInvoiceFormReleaseInquiry.FetchSize = '';

            eInvoiceFormTypeService.getFormTypes(eInvoiceFormReleaseInquiry, $scope.einvoiceFormTypesInquiryCompleted, $scope.einvoiceFormTypesInquiryError);
        };

        $scope.einvoiceFormTypesInquiryCompleted = function(response, status) {
            alertsService.RenderSuccessMessage(response.ReturnMessage);
            $scope.eInvoiceFormTypes = response.Data.eInvoiceFormTypes;
            for (var i = 0, len = $scope.eInvoiceFormTypes.length; i < len; i++) {
                $scope.eInvoiceFormTypes[i].Name = $filter('filter')($scope.Constants.InvoiceTypes, {Code:$scope.eInvoiceFormTypes[i].InvoiceType})[0].Name + " - " + $scope.eInvoiceFormTypes[i].NumberForm + " - " + $scope.eInvoiceFormTypes[i].Symbol;
            }
        };

        $scope.einvoiceFormTypesInquiryError = function(response, status) {
            alertsService.RenderErrorMessage(response.Error);
        };
    };

    formReleaseMaintenanceController.$inject = injectParams;
    angularAMD.controller('eInvoiceFormReleaseMaintenanceController', formReleaseMaintenanceController);
});