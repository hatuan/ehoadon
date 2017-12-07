/**
 * Created by tuanha-01 on 5/24/2016.
 */
define(['application-configuration', 'ajaxService'], function (app) {

    app.register.service('organizationsService', ['ajaxService', function (ajaxService) {

        this.getOrganizations = function (organization, successFunction, errorFunction) {
            ajaxService.AjaxGetWithData(organization, "/api/organizations/GetOrganizations", successFunction, errorFunction);
        };
             
        this.getOrganizationsWithNoBlock = function (organization, successFunction, errorFunction) {
            ajaxService.AjaxGetWithNoBlock(organization, "/api/organizations/GetOrganizations", successFunction, errorFunction);
        };

        this.getOrganization = function (organizationID, successFunction, errorFunction) {
            ajaxService.AjaxGetWithData(organizationID, "/api/Organizations/GetOrganization", successFunction, errorFunction);
        };

    }]);
});