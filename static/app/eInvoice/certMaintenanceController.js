/**
 * Created by tuanha-01 on 5/13/2016.
 */
"use strict";

define(['angularAMD', 'jquery', 'ajaxService', 'alertsService'], function(angularAMD, $) {
    var injectParams = ['$scope', '$rootScope', '$state', '$window', 'moment', '$uibModal', '$uibModalInstance', 'alertsService', 'Constants'];

    var certMaintenanceController = function($scope, $rootScope, $state, $window, moment, $uibModal, $uibModalInstance, alertsService, Constants) {

        $scope.initializeController = function() {
            $scope.Constants = Constants;
        };

        $scope.$watch('$viewContentLoaded',
            function() {
                LoadCerts();
            }
        ); //$scope.watch
        
        $scope.validationOptions = {
            rules: {
                radiotaxcode: {
                    required: true
                }
            }
        };

        $scope.ok = function(form) {
            //if (form.validate()) {}
            if(angular.element("[name='radiotaxcode']:checked").length > 0) {
                var table_row = angular.element("[name='radiotaxcode']:checked").closest("tr");
                var row_index = angular.element("#certificateTable tr").index(table_row);

                var certificateList = 'certificateList[' + (row_index - 1) + ']';
                var _result = new Object();
                _result.Token = {};

                _result.Token.TokenCertValidTo = angular.element("[name='" + certificateList + ".toDate']").val();
                _result.Token.TokenCertValidFrom = angular.element("[name='" + certificateList + ".fromDate']").val();
                _result.Token.TokenSerialNumber = angular.element("[name='" + certificateList + ".serialNumber']").val();
                _result.Token.TokenSubject = angular.element("[name='" + certificateList + ".subject']").val();
                _result.Token.TokenFullSubject = angular.element("[name='" + certificateList + ".fullSubject']").val();
                _result.Token.TokenTaxCode = angular.element("[name='" + certificateList + ".taxCode']").val();
                _result.Token.TokenIssuerName = angular.element("[name='" + certificateList + ".issuer']").val();
                _result.Token.TokenCertContent = angular.element("[name='" + certificateList + ".certificateContent']").val();
                _result.Token.TokenCertAlias = angular.element("[name='" + certificateList + ".certificateAlias']").val();
                _result.Token.TokenCertVersion = angular.element("[name='" + certificateList + ".certificateVersion']").val();
                
                $uibModalInstance.close(_result);
            } else {
                alert("Không tìm thấy Chứng thư số hợp lệ hoặc chưa chọn Chứng thư số.\n\nVui lòng nhấn F5 hoặc Ctrl + F5 để đọc lại chứng thư số."); 
            }
        };
        
        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };
    };

    certMaintenanceController.$inject = injectParams;
    angularAMD.controller('CertMaintenanceController', certMaintenanceController);
});