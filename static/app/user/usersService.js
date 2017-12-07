/**
 * Created by tuanha-01 on 5/30/2016.
 */
define(['application-configuration', 'ajaxService'], function (app) {

    app.register.service('usersService', ['ajaxService', function (ajaxService) {
        
        this.getPreference = function (successFunction, errorFunction) {
            ajaxService.AjaxGet("/api/user/preference", successFunction, errorFunction);
        };

        this.updatePreference = function (preference, successFunction, errorFunction) {
            ajaxService.AjaxPost(preference, "/api/user/preference", successFunction, errorFunction);
        };

    }]);
});
