/**
 * Created by tuanha-01 on 5/13/2016.
 */
"use strict";

define(['angularAMD', 'jquery', 'ajaxService', 'alertsService', 'clientService', 'provinceService', 'digitalsignature', 'app/eInvoice/certMaintenanceController'], function(angularAMD, $) {
    var injectParams = ['$scope', '$rootScope', '$state', '$sce', '$window', 'moment', '$uibModal', 'alertsService', 'clientService', 'provinceService', '$stateParams', '$confirm', 'Constants'];

    var clientMaintenanceController = function($scope, $rootScope, $state, $sce, $window, moment, $uibModal, alertsService, clientService, provinceService, $stateParams, $confirm, Constants) {
        
        $scope.initializeController = function() {
            $scope.Constants = Constants;
            $scope.Client = {};
            $scope.Token = {};
            $scope.Provinces = [];

            $scope.getProvinces(function () { //success
                $scope.getClient();
            });
        };
        
        $scope.getProvinces = function(successFunction) {
            provinceService.getProvinces(
                function(response, status) { //success
                    $scope.Provinces = response;

                    successFunction();
                },
                function(response) { //error
                    alertsService.RenderErrorMessage(response.Error);
                }
            )
        }
        $scope.getClient = function() {
            clientService.getClient($scope.clientInquiryCompleted, $scope.clientInquiryError);
        };

        $scope.clientInquiryCompleted = function(response, status) {
            $scope.Client = response.Data.Client;
            
            $scope.Token = response.Data.eInvoiceClient;
            $scope.Token.TokenCertValidFrom = new moment.unix(response.Data.eInvoiceClient.TokenCertValidFrom).toDate();
            $scope.Token.TokenCertValidTo = new moment.unix(response.Data.eInvoiceClient.TokenCertValidTo).toDate();
        };

        $scope.clientInquiryError = function(response) {
            alertsService.RenderErrorMessage(response.Error);
        }

        $scope.validationOptions = {
            rules: {
                "Description": {
                    required: true
                },
                "Address": {
                    required: true
                },
                "Email": {
                    required: true,
                    email: true
                },
                "RepresentativeName": {
                    required: true
                },
                "RepresentativePosition": {
                    required: true
                },
                "ContactName": {
                    required: true
                },
                "Mobile": {
                    required: true
                }
            }
        };

        $scope.update = function(form) {
            if (form.validate()) {
                var _postClient = new Object();

                _postClient.Client = {};
                _postClient.eInvoiceClient = {};

                if($scope.Client.ID == null) {
                    $scope.Client.RecCreatedByID = $rootScope.currentUser.ID;
                    $scope.Client.RecCreated = new Date();
                    $scope.Client.RecModifiedByID = $rootScope.currentUser.ID;
                    $scope.Client.RecModified = new Date();

                    _postClient.Client = $scope.Client;
                    _postClient.Client.RecCreated = new moment($scope.Client.RecCreated).unix();
                    _postClient.Client.RecModified = new moment($scope.Client.RecModified).unix();
                } else {
                    $scope.Client.RecModifiedByID = $rootScope.currentUser.ID;
                    $scope.Client.RecModified = new Date();

                    _postClient.Client = $scope.Client;
                    _postClient.Client.RecModifiedByID = $rootScope.currentUser.ID;
                    _postClient.Client.RecModified = new moment($scope.Client.RecModified).unix();
                }

                _postClient.eInvoiceClient = $scope.Token;
                _postClient.eInvoiceClient.TokenCertValidFrom = new moment($scope.Token.TokenCertValidFrom).unix();
                _postClient.eInvoiceClient.TokenCertValidTo = new moment($scope.Token.TokenCertValidTo).unix();

                clientService.updateClient(_postClient, $scope.clientUpdateCompleted, $scope.clientUpdateError)
            }
        };

        $scope.clientUpdateCompleted = function(response, status) {
            $scope.clientInquiryCompleted(response, status);
        };

        $scope.clientUpdateError = function(response) {
            alertsService.RenderErrorMessage(response.Error);
        }

        $scope.cancel = function() {
            $scope.getClient();
        }

        $scope.selectCert = function() {
            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                size:'lg',
                templateUrl: 'app/eInvoice/certMaintenance.html',
                controller: 'CertMaintenanceController',
                resolve: {
                    editCert: function() {
                        var __cert = {};
                        return __cert;
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
                 
                $scope.Token.TokenCertValidFrom = new moment(_result.Token.TokenCertValidFrom, "DD-MM-YYYY").toDate();
                $scope.Token.TokenCertValidTo = new moment(_result.Token.TokenCertValidTo, "DD-MM-YYYY").toDate();
                $scope.Token.TokenSerialNumber = _result.Token.TokenSerialNumber;
                $scope.Token.TokenSubject = _result.Token.TokenSubject;
                $scope.Token.TokenFullSubject = _result.Token.TokenFullSubject;
                $scope.Token.TokenTaxCode = _result.Token.TokenTaxCode;
                $scope.Token.TokenIssuerName = _result.Token.TokenIssuerName;
                $scope.Token.TokenCertContent = _result.Token.TokenCertContent;
                $scope.Token.TokenCertAlias = _result.Token.TokenCertAlias;
                $scope.Token.TokenCertVersion= _result.Token.TokenCertVersion;

                $scope.Client.Description = $scope.Token.TokenSubject;
                $scope.Client.VatNumber = $scope.Token.TokenTaxCode;
            }, function() {
                //dismissed 
            })['finally'](function() {
                modalInstance = undefined;
            }); 
        }
    };

    clientMaintenanceController.$inject = injectParams;
    angularAMD.controller('eInvoiceClientMaintenanceController', clientMaintenanceController);
});