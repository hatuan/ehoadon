/**
 * Created by tuanha-01 on 5/30/2016.
 */
define(['angularAMD', 'ajaxService'], function (angularAMD) {

    angularAMD.service('eInvoiceService', ['ajaxService', function (ajaxService) {
        
        this.getInvoices = function (data, successFunction, errorFunction) {
            ajaxService.AjaxGetWithData(data, "/api/einvoices", successFunction, errorFunction);
        };

        this.updateInvoice = function (data, successFunction, errorFunction) {
            ajaxService.AjaxPost(data, "/api/einvoices", successFunction, errorFunction);
        };

        this.deleteInvoice = function (data, successFunction, errorFunction) {
            ajaxService.AjaxDelete(data, "/api/einvoices", successFunction, errorFunction);
        };

        this.getInvoice = function (data, successFunction, errorFunction) {
            ajaxService.AjaxGetWithData(data, "/api/einvoice", successFunction, errorFunction);
        };    
    }]);
});
