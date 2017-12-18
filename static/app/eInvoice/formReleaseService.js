/**
 * Created by tuanha-01 on 5/30/2016.
 */
define(['angularAMD', 'ajaxService'], function (angularAMD) {

    angularAMD.service('eInvoiceFormReleaseService', ['ajaxService', function (ajaxService) {
        
        this.getFormReleases = function (data, successFunction, errorFunction) {
            ajaxService.AjaxGetWithData(data, "/api/einvoiceformreleases", successFunction, errorFunction);
        };

        this.updateFormRelease = function (data, successFunction, errorFunction) {
            ajaxService.AjaxPost(data, "/api/einvoiceformreleases", successFunction, errorFunction);
        };

        this.deleteFormRelease = function (data, successFunction, errorFunction) {
            ajaxService.AjaxDelete(data, "/api/einvoiceformreleases", successFunction, errorFunction);
        };

        this.getFormRelease = function (data, successFunction, errorFunction) {
            ajaxService.AjaxGetWithData(data, "/api/einvoiceformrelease", successFunction, errorFunction);
        };    

        this.getFormReleaseByMaxReleaseTo = function (data, successFunction, errorFunction) {
            ajaxService.AjaxGetWithDataNoBlock(data, "/api/einvoiceformrelease_max_release_to", successFunction, errorFunction);
        };

    }]);
});
