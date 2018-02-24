/**
 * Created by tuanha-01 on 5/6/2016.
 */
define(['angularAMD'], function (angularAMD) {

    angularAMD.service('ajaxService', ['$http', 'blockUI', '$state', function ($http, blockUI, $state) {

        this.AjaxPost = function (data, route, successFunction, errorFunction) {
            blockUI.start();
            $http.post(route, data)
                .success(function (response, status, headers, config) {
                    blockUI.stop();
                    successFunction(response, status);
                }).error(function (response) {
                    blockUI.stop();                   
                    if (response.IsAuthenicated == false) { $state.go('login'); }
                    errorFunction(response);
                });
        }

        this.AjaxPostWithNoAuthenication = function (data, route, successFunction, errorFunction) {
            blockUI.start();
            $http.post(route, data)
                .success(function (response, status, headers, config) {
                    blockUI.stop();
                    successFunction(response, status);
                }).error(function (response) {
                    blockUI.stop();                 
                    errorFunction(response);
                });
        }

        this.AjaxGet = function (route, successFunction, errorFunction) {
            blockUI.start();
            $http({ method: 'GET', url: route }).success(function (response, status, headers, config) {
                blockUI.stop();
                successFunction(response, status);
            }).error(function (response) {
                blockUI.stop();
                if (response.IsAuthenicated == false) { $state.go('login'); }
                errorFunction(response);
            });
        }

        this.AjaxGetNoBlock = function (route, successFunction, errorFunction) {
            $http({ method: 'GET', url: route }).success(function (response, status, headers, config) {
                successFunction(response, status);
            }).error(function (response) {
                if (response.IsAuthenicated == false) { $state.go('login'); }
                errorFunction(response);
            });
        }

        this.AjaxGetWithData = function (data, route, successFunction, errorFunction) {
            blockUI.start();
            $http({ method: 'GET', url: route, params: data }).success(function (response, status, headers, config) {
                blockUI.stop();
                successFunction(response, status);
            }).error(function (response) {
                blockUI.stop();
                if (response.IsAuthenicated == false) { $state.go('login'); }
                errorFunction(response);
            });
        }


        this.AjaxGetWithDataNoBlock = function (data, route, successFunction, errorFunction) {            
            $http({ method: 'GET', url: route, params: data }).success(function (response, status, headers, config) {                 
                successFunction(response, status);
            }).error(function (response) {
                if (response.IsAuthenicated == false) { $state.go('login'); }
                errorFunction(response);
            });
        }

        this.AjaxDelete = function (data, route, successFunction, errorFunction) {            
            $http({ method: 'DELETE', url: route, params: data }).success(function (response, status, headers, config) {                 
                successFunction(response, status);
            }).error(function (response) {
                if (response.IsAuthenicated == false) { $state.go('login'); }
                errorFunction(response);
            });
        }
    }]);
});


