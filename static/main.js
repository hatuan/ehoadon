/**
 * Created by tuanha-01 on 5/6/2016.
 */

require.config({
    //disable timeout
    waitSeconds: 0, 

    baseUrl: "",

    // alias libraries paths
    paths: {
        'application-configuration': 'app/application-configuration',
        'angular': 'bower_components/angular/angular.min',
        'angularAMD': 'bower_components/angularAMD/angularAMD.min',
        'jquery': 'bower_components/jquery/dist/jquery.min',
        'jquery.validate': 'bower_components/jquery-validation/dist/jquery.validate.min',
        'jquery-validation-globalize': 'bower_components/jquery-validation-globalize/jquery.validate.globalize.min',
        'jquery.validation.extend': 'scripts/jquery.validation.extend',
        'jquery-ui': 'bower_components/jquery-ui/jquery-ui.min',
        'bootstrap': 'bower_components/bootstrap/dist/js/bootstrap.min',
        'blockUI': 'bower_components/angular-block-ui/dist/angular-block-ui.min',
        'ui.router': 'bower_components/angular-ui-router/release/angular-ui-router.min',
        'satellizer': 'bower_components/satellizer/satellizer',
        'pascalprecht.translate': 'bower_components/angular-translate/angular-translate.min',
        'toastr': 'bower_components/angular-toastr/dist/angular-toastr.tpls.min',
        'moment': 'bower_components/moment/min/moment-with-locales.min',
        'angular-moment': 'bower_components/angular-moment/angular-moment.min',
        'angular-validate': 'bower_components/jpkleemans-angular-validate/dist/angular-validate.min',
        'angular-globalize-wrapper': 'bower_components/angular-globalize-wrapper/dist/angular-globalize-wrapper.min',
        'ui-bootstrap': 'bower_components/angular-bootstrap/ui-bootstrap-tpls.min',
        //"kendo.all.min": "scripts/kendo-ui/kendo.all.min",
        "kendo.core.min": "scripts/kendo-ui/kendo.core.min",
        "kendo.angular.min": "scripts/kendo-ui/kendo.angular.min",
        'kendo.culture.en': "scripts/kendo-ui/cultures/kendo.culture.en.min",
        'kendo.culture.us': "scripts/kendo-ui/cultures/kendo.culture.en-US.min",
        'kendo.culture.vi': "scripts/kendo-ui/cultures/kendo.culture.vi.min",
        'kendo.culture.vn': "scripts/kendo-ui/cultures/kendo.culture.vi-VN.min",
        'ngInfiniteScroll': "bower_components/ngInfiniteScroll/build/ng-infinite-scroll.min",
        'bootstrap-switch': 'bower_components/bootstrap-switch/dist/js/bootstrap-switch.min',
        'angular-bootstrap-switch': 'bower_components/angular-bootstrap-switch/dist/angular-bootstrap-switch.min',
        'angular-confirm-modal': 'bower_components/angular-confirm-modal/angular-confirm.min',
        'ajaxService': 'app/common/services/ajaxServices',
        'alertsService': 'app/common/services/alertsServices',
        'stateConfig': 'app/common/config/stateConfig',
        'myApp.Constants': 'app/common/constants',
        'myApp.Capitalize': 'app/common/capitalize',
        'myApp.Search': 'app/common/directives/searchForm',
        'myApp.navBar': 'app/main/navBarController',
        'organizationsService': 'app/organization/organizationsService',
        'usersService': 'app/user/usersService',
        'myApp.autoComplete': 'app/common/directives/autoComplete',
        'eInvoiceCustomerService': 'app/eInvoice/customerService'
    },
    // Add angular modules that does not support AMD out of the box, put it in a shim
    shim: {
        'jquery.validate': { deps: ["jquery"] },
        'jquery.validation.extend': { deps: ["jquery", 'jquery.validate'] },
        'jquery-ui': { deps: ["jquery"] },
        'angular': { deps: ["jquery"], 'exports': 'angular' },
        'angularAMD': ['angular'],
        'bootstrap': ['jquery'],
        'blockUI': ['angular'],
        'ui.router': ['angular'],
        'satellizer': ['angular'],
        'pascalprecht.translate': ['angular'],
        'toastr': ['angular'],
        'moment': ['angular'],
        'angular-moment': ['angular', 'moment'],
        'angular-validate': ['angular', 'jquery.validate'],
        'ui-bootstrap': ["angular"],
        //"kendo.all.min": ["angular"],
        "kendo.core.min": ["jquery"],
        "kendo.angular.min": ["angular","kendo.core.min"],
        'angular-globalize-wrapper': ['angular'],
        'jquery-validation-globalize': ['jquery.validate'],
        'kendo.culture.en': ["kendo.core.min"],
        'kendo.culture.us': ["kendo.core.min"],
        'kendo.culture.vi': ["kendo.core.min"],
        'kendo.culture.vn': ["kendo.core.min"],
        'ngInfiniteScroll': ['angular'],
        'bootstrap-switch': ['jquery'],
        'angular-bootstrap-switch': ['angular', 'bootstrap-switch']
    },

    // kick start application
    deps: ['application-configuration']
});