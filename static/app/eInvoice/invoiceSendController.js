/**
 * Created by tuanha-01 on 5/13/2016.
 */
"use strict";

define(['angularAMD', 'jquery', 'einvoiceMailService'], function(angularAMD, $) {
    var injectParams = ['$scope', '$rootScope', 'moment','$uibModal', '$uibModalInstance', 'einvoiceMailService', 'editInvoice'];

    var invoiceSendController = function($scope, $rootScope, moment, $uibModal, $uibModalInstance, einvoiceMailService, editInvoice) {
       
        $scope.initializeController = function() {
            $scope.EditInvoice = editInvoice;
            $scope.MailAddress = $scope.EditInvoice.CustomerContactEmail;
            $scope.SendBy = 0; //Mail
        }

        $scope.validationOptions = {
            rules: {
                "MailAddress": {
                    required: true
                },
            }
        };

        $scope.sendDocument = function(form) {
            if (form.validate()) {
                var _document = $.extend(true, {}, $scope.EditInvoice);

                _document.InvoiceDate = new moment(_document.InvoiceDate).unix();
                _document.OriginalInvoiceDate = new moment(_document.OriginalInvoiceDate).unix();
                _document.RecCreated = new moment(_document.RecCreated).unix();
                _document.RecModified = new moment(_document.RecModified).unix();
                _document.CustomerContactEmail = $scope.MailAddress;

                einvoiceMailService.Mail(_document,
                    function(response) {
                        alert('Document mailed successfuly');
                    }, 
                    function(response) {
                        alert('Document mailed error');
                    }
                );
            }
        }

        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };
        
        $scope.$on('modal.closing', function(event, reason, closed){
            $uibModalInstance.result.EditInvoice = $scope.EditInvoice;
        });
    };

    invoiceSendController.$inject = injectParams;
    angularAMD.controller('eInvoiceSendController', invoiceSendController);
});