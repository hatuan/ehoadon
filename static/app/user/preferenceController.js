/**
 * Created by tuanha-01 on 5/13/2016.
 */
"use strict";

define(['application-configuration', 'ajaxService', 'alertsService', 'organizationsService', 'usersService'], function (app, $) {
    var injectParams = ['$scope', '$rootScope', '$state', '$window', 'moment', 'alertsService', 'organizationsService', 'usersService'];

    var PreferenceController = function ($scope, $rootScope, $state, $window, moment, alertsService, organizationsService, usersService) {

        $scope.initializeController = function () {
            $rootScope.applicationModule = "Preference";

            $scope.OrganizationID = "";
            $scope.CultureUIID = "";
            //$scope.WorkingDate = "";
            $scope.WorkingDate = new Date();

            $scope.getOrganizations();
            $scope.CultureUIs = [{ "ID": "vi-VN", "Name": "Viet Nam" }, { "ID": "en-US", "Name": "English" }];
        };

        $scope.getOrganizations = function () {

            var organizationInquiry = {};
            organizationsService.getOrganizations(organizationInquiry, $scope.organizationInquiryCompleted, $scope.organizationInquiryError)
        };

        $scope.organizationInquiryError = function (response) {
            alertsService.RenderErrorMessage(response.ReturnMessage);
            $scope.clearValidationErrors();
            alertsService.SetValidationErrors($scope, response.ValidationErrors);
        };

        $scope.organizationInquiryCompleted = function (response) {
            $scope.clearValidationErrors();
            alertsService.RenderSuccessMessage(response.ReturnMessage);
            $scope.Organizations = response.Data.Organizations;
            $scope.TotalRows = response.TotalRows;
            $scope.TotalPages = response.TotalPages;

            $scope.getPreference();
        };

        $scope.getPreference = function () {
            usersService.getPreference($scope.getPreferenceCompleted, $scope.getPreferenceError)
        };

        $scope.getPreferenceError = function (response) {
            alertsService.RenderErrorMessage(response.ReturnMessage);
            $scope.clearValidationErrors();
        };

        $scope.getPreferenceCompleted = function (response) {
            $scope.clearValidationErrors();
            alertsService.RenderSuccessMessage(response.ReturnMessage);
            
            $rootScope.Preference = response.Data.Preference;

            $scope.OrganizationID = response.Data.Preference.OrganizationID;
            $scope.CultureUIID = response.Data.Preference.CultureUIID;
            $scope.WorkingDate = new moment.unix(response.Data.Preference.WorkingDate).toDate();
        };

        $scope.clearValidationErrors = function () {
            $scope.WorkingDateInputError = false;
            $scope.CultureUIInputError = false;
            $scope.OrganizationIdInputError = false;
        };

        $scope.createPreferenceObject = function () {
            var preference = new Object();
            preference.OrganizationID = $scope.OrganizationID;
            preference.CultureUIID = $scope.CultureUIID;
            preference.WorkingDate = new moment($scope.WorkingDate).unix();
            return preference;

        };

        $scope.validationOptions = {
            rules: {
                Organization: {
                    required: true
                },
                CultureUI: {
                    required: true
                },
                WorkingDate: {
                    date: true,
                    required: true
                }
            }
        };
   
        $scope.updatePreference = function (form) {
            if(form.validate()) {
                var preference = $scope.createPreferenceObject();
                usersService.updatePreference(preference, $scope.updatePreferenceCompleted, $scope.updatePreferenceError)
            }
        };

        $scope.updatePreferenceCompleted = function (response) {
            $scope.clearValidationErrors();
            alertsService.RenderSuccessMessage(response.ReturnMessage);
            
            $rootScope.Preference = response.Data.Preference;
            $rootScope.Preference.WorkingDateUnix = $rootScope.Preference.WorkingDate;
            $rootScope.Preference.WorkingDate = new moment.unix($rootScope.Preference.WorkingDate).toDate();
            

            setTimeout(function () {
                $state.go('home');
            }, 10);
        };

        $scope.updatePreferenceError = function (response) {
            alertsService.RenderErrorMessage(response.ReturnMessage);
            $scope.clearValidationErrors();
            alertsService.SetValidationErrors($scope, response.ValidationErrors);
        };
    };

    PreferenceController.$inject = injectParams;
    app.register.controller('PreferenceController', PreferenceController);
});
