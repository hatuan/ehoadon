/**
 * Created by tuanha-01 on 5/30/2016.
 */
define(['angularAMD', 'ajaxService'], function (angularAMD) {

    angularAMD.service('eInvoiceFormTypeService', ['ajaxService', function (ajaxService) {
        
        this.getFormTypes = function (data, successFunction, errorFunction) {
            ajaxService.AjaxGetWithData(data, "/api/einvoiceformtypes", successFunction, errorFunction);
        };

        this.updateFormType = function (data, successFunction, errorFunction) {
            ajaxService.AjaxPost(data, "/api/einvoiceformtypes", successFunction, errorFunction);
        };

        this.deleteFormType = function (data, successFunction, errorFunction) {
            ajaxService.AjaxDelete(data, "/api/einvoiceformtypes", successFunction, errorFunction);
        };

        this.getFormType = function (data, successFunction, errorFunction) {
            ajaxService.AjaxGetWithData(data, "/api/einvoiceformtype", successFunction, errorFunction);
        };    
    }]);
});
