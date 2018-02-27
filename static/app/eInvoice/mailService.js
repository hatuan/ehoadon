/**
 * Created by tuanha-01 on 5/30/2016.
 */
define(['angularAMD', 'jquery', 'ajaxService', 'clientService'], function (angularAMD, $) {

    var injectParams = ['$auth', '$window', '$http', 'blockUI', 'moment', 'ajaxService', 'Constants'];

    var einvoiceMailFunction = function($auth, $window, $http, blockUI, moment, ajaxService, Constants) { 
        this.Mail = function(document, successFunction, errorFunction) {
            $http.post('/api/einvoicemail', document)
                .success(function (response, status) {
                    successFunction(response, status);
                })
                .error(function (response) {
                    errorFunction(response);
                });
        };
    }

    einvoiceMailFunction.$inject = injectParams;
    angularAMD.service('einvoiceMailService', einvoiceMailFunction);
});
