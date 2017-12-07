/**
 * Created by tuanha-01 on 5/30/2016.
 */
define(['angularAMD', 'ajaxService'], function (angularAMD) {

    angularAMD.service('eInvoiceCustomerService', ['ajaxService', function (ajaxService) {
        
        this.getCustomers = function (data, successFunction, errorFunction) {
            ajaxService.AjaxGetWithData(data, "/api/einvoicecustomers", successFunction, errorFunction);
        };

        this.updateCustomer = function (data, successFunction, errorFunction) {
            ajaxService.AjaxPost(data, "/api/einvoicecustomers", successFunction, errorFunction);
        };

        this.deleteCustomer = function (data, successFunction, errorFunction) {
            ajaxService.AjaxDelete(data, "/api/einvoicecustomers", successFunction, errorFunction);
        };

        this.getCustomer = function (data, successFunction, errorFunction) {
            ajaxService.AjaxGetWithData(data, "/api/einvoicecustomer", successFunction, errorFunction);
        };    
    }]);
});
