/**
 * Created by tuanha-01 on 5/13/2016.
 */
"use strict";

define(['angularAMD', 'jquery', 'ajaxService', 'alertsService', 'myApp.Search', 'eInvoiceFormReleaseService', 'app/eInvoice/formReleaseMaintenanceController'], function (angularAMD, $) {
    var injectParams = ['$scope', '$rootScope', '$state', '$window', 'moment', '$uibModal', 'alertsService', 'Constants', 'eInvoiceFormReleaseService'];

    var einvoiceFormReleasesController = function ($scope, $rootScope, $state, $window, moment, $uibModal, alertsService, Constants, eInvoiceFormReleaseService) {

        $scope.initializeController = function () {
            $rootScope.applicationModule = "eInvoiceFormReleases";
            $rootScope.alerts = [];
            
            $scope.Constants = Constants;

            $scope.Search = "";
            $scope.isSearched = false;
            $scope.SortExpression = "release_date";
            $scope.SortDirection = "ASC";
            $scope.FetchSize = 100;
            $scope.CurrentPage = 1;
            $scope.PageSize = 9;
            $scope.TotalRows = 0;
            $scope.Selection=[];

            $scope.searchConditionObjects = [];
            
            $scope.searchConditionObjects.push({
                ID: "ehd_form_release.release_date",
                Name: "Date Release",
                Type: "DATE", //CODE, FREE, DATE
                ValueIn: "",
                Value: ""
            });
            
            $scope.eInvoiceFormReleases = [];
            $scope.FilteredFormReleases = [];
            $scope.selectReports = false;
            $scope.getFormReleases();
        };

        $scope.refresh = function () {
            $scope.getFormReleases();
        }

        $scope.showSearch = function () {
            $scope.isSearched = !$scope.isSearched;
        }

        $scope.selectAll = function () {
            $scope.Selection=[];
            for(var i = 0; i < $scope.FilteredFormReleases.length; i++) {
                $scope.Selection.push($scope.FilteredFormReleases[i]["ID"]);
            }
        }

        $scope.delete = function () {
            if($scope.Selection.length <= 0)
                return;
            var deleteEInvoiceFormReleases = $scope.createDeleteFormReleaseObject()
            eInvoiceFormReleaseService.deleteFormRelease(deleteEInvoiceFormReleases, 
                function (response, status) {
                    $scope.getFormReleases();
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

        $scope.getFormReleases = function (searchSqlCondition) {
            if(!angular.isUndefinedOrNull(searchSqlCondition))
                $scope.Search = searchSqlCondition;
            var eInvoiceFormReleaseInquiry = $scope.createFormReleaseObject();
            eInvoiceFormReleaseService.getFormReleases(eInvoiceFormReleaseInquiry, $scope.einvoiceFormReleasesInquiryCompleted, $scope.einvoiceFormReleasesInquiryError);
        };

        $scope.einvoiceFormReleasesInquiryCompleted = function (response, status) {
            alertsService.RenderSuccessMessage(response.ReturnMessage);
            $scope.eInvoiceFormReleases = response.Data.eInvoiceFormReleases;
            for (var i = 0, len = $scope.eInvoiceFormReleases.length; i < len; i++) {
                $scope.eInvoiceFormReleases[i].ReleaseDate = new moment.unix($scope.eInvoiceFormReleases[i].ReleaseDate).toDate();
                $scope.eInvoiceFormReleases[i].StartDate = new moment.unix($scope.eInvoiceFormReleases[i].StartDate).toDate();

                $scope.eInvoiceFormReleases[i].NumberFormDescription = $filter('filter')($scope.Constants.InvoiceTypes, {Code:$scope.eInvoiceFormReleases[i].FormTypeInvoiceType})[0].Name + " - " + $scope.eInvoiceFormReleases[i].FormTypeNumberForm + " - " + $scope.eInvoiceFormReleases[i].FormTypeSymbol;
                $scope.eInvoiceFormReleases[i].NumberReleaseDescription = "Total Release : " +  $scope.eInvoiceFormReleases[i].ReleaseTotal + "(From : " + $scope.eInvoiceFormReleases[i].ReleaseForm + " - To : " + $scope.eInvoiceFormReleases[i].ReleaseTo + ")";
            }
            $scope.TotalRows = response.TotalRows;
            $scope.Selection = [];
            $scope.FilteredFormReleases = [];
        };

        $scope.einvoiceFormReleasesInquiryError = function (response, status) {
            alertsService.RenderErrorMessage(response.Error);
        }

        $scope.createFormReleaseObject = function () {
            var eInvoiceFormReleaseInquiry = new Object();

            eInvoiceFormReleaseInquiry.Search = $scope.Search;
            eInvoiceFormReleaseInquiry.SortExpression = $scope.SortExpression;
            eInvoiceFormReleaseInquiry.SortDirection = $scope.SortDirection;
            eInvoiceFormReleaseInquiry.FetchSize = $scope.FetchSize;

            return eInvoiceFormReleaseInquiry;
        }

        $scope.createDeleteFormReleaseObject = function() {
            var deleteFormReleases = new Object();
            deleteFormReleases.ID = $scope.Selection.join(",");
            return deleteFormReleases;
        }

        $scope.edit = function (_formRelease) {
            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                //size:'lg',
                templateUrl: 'app/eInvoice/formReleaseMaintenance.html',
                controller: 'eInvoiceFormReleaseMaintenanceController',
                resolve: {
                    editFormRelease: function() {
                        var __formRelease = $.extend({}, _formRelease);
                        return __formRelease;
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

                _formRelease = _result.EditFormRelease;
            }, function(_result) {
                //dismissed 
            })['finally'](function() {
                modalInstance = undefined;
            });    
        };
    };

    einvoiceFormReleasesController.$inject = injectParams;
    angularAMD.controller('eInvoiceFormReleasesController', einvoiceFormReleasesController);
});
