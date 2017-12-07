/**
 * Created by tuanha-01 on 5/6/2016.
 */
define(['angularAMD'], function (angularAMD) {

    angularAMD.service('alertsService', ['$rootScope', 'toastr', function ($rootScope, toastr) {

        $rootScope.alerts = [];
        $rootScope.MessageBox = "";

        this.SetValidationErrors = function (scope, validationErrors) {

            for (var prop in validationErrors) {
                var property = prop + "InputError";
                scope[property] = true;
            }
        };

        this.RenderFloatErrorMessage = function(message) {
            var messageBox = formatMessage(message);
            toastr.error(messageBox, 'Error');
        };

        this.RenderFloatSuccessMessage = function(message) {
            var messageBox = formatMessage(message);
            toastr.success(messageBox, 'Success');
        };

        this.RenderFloatWarningMessage = function(message) {
            var messageBox = formatMessage(message);
            toastr.warning(messageBox, 'Warning');
        };

        this.RenderFloatInformationMessage = function(message) {
            var messageBox = formatMessage(message);
            toastr.info(messageBox, 'Information');
        };

        this.RenderErrorMessage = function (message) {

            var messageBox = formatMessage(message);
            $rootScope.alerts = [];
            $rootScope.MessageBox = messageBox;
            $rootScope.alerts.push({ 'type': 'danger', 'msg': '' });

        };

        this.RenderSuccessMessage = function (message) {
            var messageBox = formatMessage(message);
            $rootScope.alerts = [];
            $rootScope.MessageBox = messageBox;
            $rootScope.alerts.push({ 'type': 'success', 'msg': '' });
        };

        this.RenderWarningMessage = function (message) {

            var messageBox = formatMessage(message);
            $rootScope.alerts = [];
            $rootScope.MessageBox = messageBox;
            $rootScope.alerts.push({ 'type': 'warning', 'msg': '' });
        };

        this.RenderInformationMessage = function (message) {

            var messageBox = formatMessage(message);
            $rootScope.alerts = [];
            $rootScope.MessageBox = messageBox;
            $rootScope.alerts.push({ 'type': 'info', 'msg': '' });
        };

        this.closeAlert = function (index) {
            $rootScope.alerts.splice(index, 1);
        };

        function formatMessage(message) {
            var messageBox = "";
            if (angular.isArray(message) == true) {
                for (var i = 0; i < message.length; i++) {
                    messageBox = messageBox + message[i] + "<br/>";
                }
            }
            else {
                messageBox = message;
            }

            return messageBox;

        }

    }]);
});