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
                $scope.EditFormRelease.StartDate = new moment().add(2, 'days').toDate();
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

            $.validator.addMethod("validStartDate", function(value, element, params) {
                if (this.optional(element))
                    return true;
                return $scope.validStartDate(value);
              }, "Please specify the correct StartDate");

            $scope.getInvoiceForms();
        };

        $scope.$watch(function(scope) {
            return scope.EditFormRelease.ReleaseTotal; 
        }, function(newValue, oldValue) {
            $scope.EditFormRelease.ReleaseTo = $scope.EditFormRelease.ReleaseFrom + newValue;
        });

        $scope.validationOptions = {
            rules: {
                "FormNumber": {
                    required: true
                },
                "ReleaseTotal": {
                    required: true,
                    min: 1,
                    number: true
                },
                "ReleaseFrom": {
                    required: true,
                    min: 1,
                    number: true
                },
                "ReleaseTo": {
                    required: true,
                    min: 1,
                    number: true
                },
                "ReleaseDate": {
                    required: true,
                    date: true
                },
                "StartDate": {
                    required: true,
                    date: true,
                    validStartDate: true
                }
            }
        };

        $scope.validStartDate = function(value) {
            var _startDate = new moment($scope.EditFormRelease.StartDate);
            var _validDate = new moment($scope.EditFormRelease.ReleaseDate).add(2, 'days');

            return _startDate >= _validDate;
        };

        $scope.ok = function(form) {
            if (form.validate({
                /*
                showErrors: function(errorMap, errorList) {
                    // Clean up any tooltips for valid elements
                    $.each(this.validElements(), function (index, element) {
                        var $element = $(element);
                        $element.data("title", "") // Clear the title - there is no error associated anymore
                            .removeClass("error")
                            .tooltip("destroy");
                    });
          
                    // Create new tooltips for invalid elements
                    $.each(errorList, function (index, error) {
                        var $element = $(error.element);
                        $element.tooltip("destroy") // Destroy any pre-existing tooltip so we can repopulate with new tooltip content
                            .data("title", error.message)
                            .addClass("error")
                            .tooltip(); // Create a new tooltip based on the error messsage we just set in the title
                    });
                },*/
            })) {
                var _postFormRelease = new Object();

                if($scope.EditFormRelease.ID == null) {
                    $scope.EditFormRelease.RecCreatedByID = $rootScope.currentUser.ID;
                    $scope.EditFormRelease.RecCreated = new Date();
                    $scope.EditFormRelease.RecModifiedByID = $rootScope.currentUser.ID;
                    $scope.EditFormRelease.RecModified = new Date();
                } else {
                    $scope.EditFormRelease.RecModifiedByID = $rootScope.currentUser.ID;
                    $scope.EditFormRelease.RecModified = new Date();

                }
                _postFormRelease = _.assign({}, $scope.EditFormRelease);
                _postFormRelease.RecCreated = new moment(_postFormRelease.RecCreated).unix();
                _postFormRelease.RecModified = new moment(_postFormRelease.RecModified).unix();
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
            _result.EditFormRelease = response.Data.eInvoiceFormRelease;
            _result.EditFormRelease.ReleaseDate = new moment.unix(_result.EditFormRelease.ReleaseDate).toDate();
            _result.EditFormRelease.StartDate = new moment.unix(_result.EditFormRelease.StartDate).toDate();

            _result.EditFormRelease.NumberFormDescription = $filter('filter')($scope.Constants.InvoiceTypes, {Code:_result.EditFormRelease.FormTypeInvoiceType})[0].Name + " - " + _result.EditFormRelease.FormTypeNumberForm + " - " + _result.EditFormRelease.FormTypeSymbol;
            _result.EditFormRelease.NumberReleaseDescription = "Total Release : " +  _result.EditFormRelease.ReleaseTotal + " (From : " + _result.EditFormRelease.ReleaseFrom + " - To : " + _result.EditFormRelease.ReleaseTo + ")";
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

        $scope.updateFormType = function() {
            $scope.updateReleaseFrom();
        };

        $scope.updateReleaseFrom = function() {
            if (!angular.isUndefinedOrNull($scope.EditFormRelease.ID)) return; //if Edit don't allow change ReleaseFrom
            
            var eInvoiceFormReleaseInquiry = new Object();
            eInvoiceFormReleaseInquiry.ID = 0; //angular.isUndefinedOrNull($scope.EditFormRelease.ID) ? 0 : $scope.EditFormRelease.ID;
            eInvoiceFormReleaseInquiry.FormTypeID = $scope.EditFormRelease.FormTypeID;

            eInvoiceFormReleaseService.getFormReleaseByMaxReleaseTo(eInvoiceFormReleaseInquiry,
                function (response, status) { //success
                    var _releaseTo = response.Data.ReleaseTo;

                    if (angular.isUndefinedOrNull(_releaseTo)) 
                        _releaseTo = 0;

                    $scope.EditFormRelease.ReleaseFrom = _releaseTo + 1;
                    $scope.EditFormRelease.ReleaseTo = $scope.EditFormRelease.ReleaseFrom + $scope.EditFormRelease.ReleaseTotal;
                }, 
                function (response, status) { //fail
                    alertsService.RenderErrorMessage(response.Error);
                    $scope.EditFormRelease.ReleaseFrom = 0;
                    $scope.EditFormRelease.ReleaseTo = 0;
                });
        }
    };

    formReleaseMaintenanceController.$inject = injectParams;
    angularAMD.controller('eInvoiceFormReleaseMaintenanceController', formReleaseMaintenanceController);
});