/**
 * Created by tuanha-01 on 5/6/2016.
 */
define(['angularAMD'], function (angularAMD) {

    angularAMD.service('ajaxService', ['$http', 'blockUI', '$state', function ($http, blockUI, $state) {

        // setting timeout of 1 second to simulate a busy server.

        this.AjaxPost = function (data, route, successFunction, errorFunction) {
            blockUI.start();
            setTimeout(function () {
                $http.post(route, data).success(function (response, status, headers, config) {
                    blockUI.stop();
                    successFunction(response, status);
                }).error(function (response) {
                    blockUI.stop();                   
                    if (response.IsAuthenicated == false) { $state.go('login'); }
                    errorFunction(response);
                });
            }, 1000);

        }

        this.AjaxPostWithNoAuthenication = function (data, route, successFunction, errorFunction) {
            blockUI.start();
            setTimeout(function () {
                $http.post(route, data).success(function (response, status, headers, config) {
                    blockUI.stop();
                    successFunction(response, status);
                }).error(function (response) {
                    blockUI.stop();                 
                    errorFunction(response);
                });
            }, 1000);

        }

        this.AjaxGet = function (route, successFunction, errorFunction) {
            blockUI.start();
            setTimeout(function () {
                $http({ method: 'GET', url: route }).success(function (response, status, headers, config) {
                    blockUI.stop();
                    successFunction(response, status);
                }).error(function (response) {
                    blockUI.stop();
                    if (response.IsAuthenicated == false) { $state.go('login'); }
                    errorFunction(response);
                });
            }, 1000);

        }

        this.AjaxGetWithData = function (data, route, successFunction, errorFunction) {
            blockUI.start();
            setTimeout(function () {
                $http({ method: 'GET', url: route, params: data }).success(function (response, status, headers, config) {
                    blockUI.stop();
                    successFunction(response, status);
                }).error(function (response) {
                    blockUI.stop();
                    if (response.IsAuthenicated == false) { $state.go('login'); }
                    errorFunction(response);
                });
            }, 1000);

        }


        this.AjaxGetWithDataNoBlock = function (data, route, successFunction, errorFunction) {            
            setTimeout(function () {
                $http({ method: 'GET', url: route, params: data }).success(function (response, status, headers, config) {                 
                    successFunction(response, status);
                }).error(function (response) {
                    if (response.IsAuthenicated == false) { $state.go('login'); }
                    errorFunction(response);
                });
            }, 0);

        }

        this.AjaxDelete = function (data, route, successFunction, errorFunction) {            
            setTimeout(function () {
                $http({ method: 'DELETE', url: route, params: data }).success(function (response, status, headers, config) {                 
                    successFunction(response, status);
                }).error(function (response) {
                    if (response.IsAuthenicated == false) { $state.go('login'); }
                    errorFunction(response);
                });
            }, 0);
        }

    }]);
});


