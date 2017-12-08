/**
 * Created by tuanha-01 on 5/30/2016.
 */
define(['angularAMD', 'ajaxService'], function (angularAMD) {

    angularAMD.service('eInvoiceItemUomService', ['ajaxService', function (ajaxService) {
        
        this.getItemUoms = function (data, successFunction, errorFunction) {
            ajaxService.AjaxGetWithData(data, "/api/einvoiceitemuoms", successFunction, errorFunction);
        };

        this.updateItemUom = function (data, successFunction, errorFunction) {
            ajaxService.AjaxPost(data, "/api/einvoiceitemuoms", successFunction, errorFunction);
        };

        this.deleteItemUom = function (data, successFunction, errorFunction) {
            ajaxService.AjaxDelete(data, "/api/einvoiceitemuoms", successFunction, errorFunction);
        };

        this.getItemUom = function (data, successFunction, errorFunction) {
            ajaxService.AjaxGetWithData(data, "/api/einvoiceitemuom", successFunction, errorFunction);
        };    
    }]);
});
