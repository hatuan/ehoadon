/**
 * Created by tuanha-01 on 12/19/2017.
 */
define(['angularAMD', 'ajaxService'], function (angularAMD) {

    angularAMD.service('provinceService', ['ajaxService', function (ajaxService) {
        
        this.getProvinces = function (successFunction, errorFunction) {
            ajaxService.AjaxGet("/jsons/provinces.json", successFunction, errorFunction);
        };
    }]);
});

