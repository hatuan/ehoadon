/**
 * Created by tuanha-01 on 5/6/2016.
 */
define(['angularAMD', 'ajaxService'], function (angularAMD) {

    angularAMD.service('reportService', ['ajaxService', function (ajaxService) {
        
        this.getReports = function (data, successFunction, errorFunction) {
            ajaxService.AjaxGetWithData(data, "/api/reports", successFunction, errorFunction);
        };

        this.updateFormType = function (data, successFunction, errorFunction) {
            ajaxService.AjaxPost(data, "/api/reports", successFunction, errorFunction);
        };

        this.deleteFormType = function (data, successFunction, errorFunction) {
            ajaxService.AjaxDelete(data, "/api/reports", successFunction, errorFunction);
        };

        this.getReport = function (data, successFunction, errorFunction) {
            ajaxService.AjaxGetWithData(data, "/api/report", successFunction, errorFunction);
        };    
    }]);
});

