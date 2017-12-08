/**
 * Created by tuanha-01 on 5/30/2016.
 */
define(['angularAMD', 'ajaxService'], function (angularAMD) {

    angularAMD.service('eInvoiceItemService', ['ajaxService', function (ajaxService) {
        
        this.getItems = function (data, successFunction, errorFunction) {
            ajaxService.AjaxGetWithData(data, "/api/einvoiceitems", successFunction, errorFunction);
        };

        this.updateItem = function (data, successFunction, errorFunction) {
            ajaxService.AjaxPost(data, "/api/einvoiceitems", successFunction, errorFunction);
        };

        this.deleteItem = function (data, successFunction, errorFunction) {
            ajaxService.AjaxDelete(data, "/api/einvoiceitems", successFunction, errorFunction);
        };

        this.getItem = function (data, successFunction, errorFunction) {
            ajaxService.AjaxGetWithData(data, "/api/einvoiceitem", successFunction, errorFunction);
        };    
    }]);
});
