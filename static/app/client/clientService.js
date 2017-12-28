/**
 * Created by tuanha-01 on 5/24/2016.
 */
define(['application-configuration', 'ajaxService'], function (app) {

    app.register.service('clientService', ['ajaxService', function (ajaxService) {
        this.updateClient = function (data, successFunction, errorFunction) {
            ajaxService.AjaxPost(data, "/api/client", successFunction, errorFunction);
        };

        this.getClient = function (successFunction, errorFunction) {
            ajaxService.AjaxGet("/api/client", successFunction, errorFunction); //Don't need data because requestUser has clientID
        };

    }]);
});