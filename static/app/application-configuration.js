/**
 * Created by tuanha-01 on 5/6/2016.
 */
"use strict";
//'kendo.core.min', 'kendo.angular.min', 'kendo.numerictextbox.min', 'kendo.culture.en', 'kendo.culture.us', 'kendo.culture.vi', 'kendo.culture.vn', 'angular-sanitize', 'angular-touch', 'metronic-app', 'metronic-layout'
define(['angularAMD', 'jquery', 'jquery.validate', 'jquery.validation.extend', 'bootstrap', 'ui-bootstrap',  'angular-validate', 'angular-globalize-wrapper', 'jquery-validation-globalize', 'angular-sanitize', 'angular-touch', 'ui.router', 'satellizer', 'pascalprecht.translate', 'blockUI', 'stateConfig', 'toastr', 'angular-moment', 'ngInfiniteScroll', 'bootstrap-switch', 'angular-bootstrap-switch', 'angular-confirm-modal', 'angular-dynamic-number', 'metronic-app', 'metronic-layout', 'bootstrap-hover-dropdown', 'angular-ui-grid', 'angular-smart-table', 'lodash', 'myApp.Header', 'myApp.Capitalize', 'myApp.Constants'], function(angularAMD, $) {
    var app = angular.module("myApp", ['ngSanitize', 'ngTouch', 'ui.router', 'satellizer', 'pascalprecht.translate', 'blockUI', 'toastr', 'angularMoment', 'ui.bootstrap', 'ngValidate', 'globalizeWrapper', 'infinite-scroll', 'frapontillo.bootstrap-switch', 'angular-confirm', 'dynamicNumber', 'smart-table', 'ui.grid', 'ui.grid.selection', 'ui.grid.pagination', 'myApp.Header', 'myApp.Capitalize', 'myApp.Constants']);

    app.config(function(blockUIConfig) {

        // Change the default overlay message
        blockUIConfig.message = "executing...";
        // Change the default delay to 100ms before the blocking is visible
        blockUIConfig.delay = 1;
        // Disable automatically blocking of the user interface
        blockUIConfig.autoBlock = false;
        // Provide a custom template to use
        blockUIConfig.template = '<div class=\"block-ui-overlay\"><div class=\"page-spinner-bar\"> <div class=\"bounce1\"></div> <div class=\"bounce2\"></div> <div class=\"bounce3\"></div> </div> </div>';
    });

    app.config(['$authProvider', function($authProvider) {
        // Satellizer configuration that specifies which API
        // route the JWT should be retrieved from
        $authProvider.loginUrl = '/api/token-auth';
        $authProvider.loginRoute = '/login';
        $authProvider.tokenName = "Token";
    }]);

    //https://github.com/Foxandxss/angular-toastr
    app.config(function(toastrConfig) {
        angular.extend(toastrConfig, {
            allowHtml: true,
            closeButton: true,
            closeHtml: '<button>&times;</button>',
            extendedTimeOut: 1000,
            timeOut: 5000,
        });
    });

    app.config(stateConfig);

    app.config(['$validatorProvider', function($validatorProvider) {
        $validatorProvider.setDefaults({
            highlight: function(element) {
                $(element).closest('.form-group').addClass('has-error');
            },
            unhighlight: function(element) {
                $(element).closest('.form-group').removeClass('has-error');
            },
            errorElement: 'span',
            errorClass: 'has-block',
            errorPlacement: function(error, element) {
                return true;

                //if (element.parent('.input-group').length) {
                //    error.insertAfter(element.parent());
                //} else {
                //    error.insertAfter(element);
                //}
            },
            /* http://stackoverflow.com/questions/21813868/adding-jquery-validation-to-kendo-ui-elements */
            /* http://lukaszledochowski.blogspot.nl/2015/02/validation-using-aspnet-mvc-kendo-ui.html */
            /* https://github.com/jpkleemans/angular-validate */
            ignore: []
        });
    }]);

    app.config(['$httpProvider', function($httpProvider) {
        //initialize get if not there
        if (!$httpProvider.defaults.headers.get) {
            $httpProvider.defaults.headers.get = {};    
        }    
    
        // Answer edited to include suggestions from comments
        // because previous version of code introduced browser-related errors
    
        //disable IE ajax request caching
        $httpProvider.defaults.headers.get['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT';
        // extra
        $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
        $httpProvider.defaults.headers.get['Pragma'] = 'no-cache';
    }]);

    app.config(['globalizeWrapperProvider', function(globalizeWrapperProvider) {
        // The path to cldr-data
        globalizeWrapperProvider.setCldrBasePath('bower_components/cldr-data');

        // The path to messages
        globalizeWrapperProvider.setL10nBasePath('l10n');

        // Files to load in main dir: "{{cldrBasePath}}/main/{{locale}}"
        globalizeWrapperProvider.setMainResources([
            'currencies.json',
            'ca-gregorian.json',
            'timeZoneNames.json',
            'numbers.json'
        ]);

        // Files to load in supplemental dir: "{{cldrBasePath}}/supplemental'
        globalizeWrapperProvider.setSupplementalResources([
            'currencyData.json',
            'likelySubtags.json',
            'plurals.json',
            'timeData.json',
            'weekData.json'
        ]);
    }]);

    app.config(['dynamicNumberStrategyProvider', function(dynamicNumberStrategyProvider){
    
        dynamicNumberStrategyProvider.addStrategy('price', {
          numInt: 9,
          numFract: 0,
          numSep: ',',
          numPos: true,
          numNeg: true,
          numRound: 'round',
          numThousand: true
        });
    
        dynamicNumberStrategyProvider.addStrategy('amount', {
            numInt: 18,
            numFract: 0,
            numSep: ',',
            numPos: true,
            numNeg: true,
            numRound: 'round',
            numThousand: true
        });
        
        dynamicNumberStrategyProvider.addStrategy('quantity', {
            numInt: 6,
            numFract: 0,
            numSep: ',',
            numPos: true,
            numNeg: true,
            numRound: 'round',
            numThousand: true
        });  

        dynamicNumberStrategyProvider.addStrategy('discount', {
            numInt: 2,
            numFract: 0,
            numSep: ',',
            numPos: true,
            numNeg: true,
            numRound: 'round',
            numThousand: true,
            numAppend: '%'
        });

    }]);
    
    /* angular-ui-select */
    //app.config(function(uiSelectConfig) {
    //    uiSelectConfig.theme = 'bootstrap';
    //});

    /* smart-table st-ratio */
    app.directive('stRatio',function(){
        return {
          link:function(scope, element, attr){
            var ratio=+(attr.stRatio);
            
            element.css('width',ratio+'%');
            
          }
        };
    });

    /* smart-table st-sentinel */
    app.directive('stSentinel', ['$parse', function ($parse){
        return {
            require: '^stTable',
            scope: false,
            link: function(scope, element, attr, ctrl){
                scope.$watch(function(){
                    return ctrl.tableState();
                }, function (newVal, oldValue){
                    var onChangeFn = $parse(attr.stSentinel);
                    onChangeFn(scope, {tableState: newVal});
                }, true);
            }
        }
    }]);

    /* smart-table st-default-selection */
    app.directive('stDefaultSelection', function () {
        return {
            require: 'stTable',
            restrict: 'A',
            scope: {
                selection: '=stDefaultSelection',
            },
            link: function link(scope, element, attrs, controller) {
                scope.$watch('selection', function (newValue, oldValue) {
                    pagination = controller.tableState().pagination;

                    if (pagination != null && pagination.number != null && newValue != null) {
                        var selectionMode = 'single',
                            pagination = controller.tableState().pagination;
        
                        var rows = controller.getFilteredCollection(),
                            indexOfRow = rows.indexOf(newValue) + 1,
                            finalPage = Math.ceil(indexOfRow / pagination.number) - 1;
        
                        if (indexOfRow > -1) {
                            controller.slice(finalPage * pagination.number, pagination.number);
                        }
                    }
                }, true);
            }
        };
    });

    /* Setup global settings */
    app.factory('settings', ['$rootScope', function($rootScope) {
        // supported languages
        var settings = {
            layout: {
                pageSidebarClosed: false, // sidebar menu state
                pageContentWhite: true, // set page content layout
                pageBodySolid: false, // solid body color state
                pageAutoScrollOnLoad: 1000 // auto scroll to top on page load
            },
            assetsPath: 'metronic/assets',
            globalPath: 'metronic/assets/global',
            layoutPath: 'metronic/assets/layouts/layout3',
        };
        
        $rootScope.settings = settings;
        return settings
    }]);
   
    app.controller('PageHeadController', ['$scope', function($scope) {
        $scope.$on('$includeContentLoaded', function() {        
            
        });
    }]);

    app.controller('indexController', ['$scope', '$rootScope', '$http', 'blockUI', function($scope, $rootScope, $http, blockUI) {
        $scope.$on('$viewContentLoaded', function() {
            App.initComponents(); // init core components
        });

        $scope.initializeController = function() {
            $rootScope.displayContent = false;
            // if ($location.path() != "") {
            $scope.initializeApplication($scope.initializeApplicationComplete, $scope.initializeApplicationError);
            // }
        };

        $scope.initializeApplicationComplete = function(response) {
            $rootScope.MenuItems = response.MenuItems;
            $rootScope.displayContent = true;
            $rootScope.IsInitAppCompleted = true;
        };

        $scope.initializeApplicationError = function(response) {
            alert("ERROR : InitializeApplication");
        };

        $scope.initializeApplication = function(successFunction, errorFunction) {
            blockUI.start();
            $scope.AjaxGet("/api/main/initializeApplication", successFunction, errorFunction);
            blockUI.stop();
        };

        $scope.AjaxGet = function(route, successFunction, errorFunction) {
            setTimeout(function() {
                $http({ method: 'GET', url: route }).success(function(response, status, headers, config) {
                    successFunction(response, status);
                }).error(function(response) {
                    errorFunction(response);
                });
            }, 1);

        };

        $scope.AjaxGetWithData = function(data, route, successFunction, errorFunction) {
            setTimeout(function() {
                $http({ method: 'GET', url: route, params: data }).success(function(response, status, headers, config) {
                    successFunction(response, status);
                }).error(function(response) {
                    errorFunction(response);
                });
            }, 1);

        }

    }]);

    app.directive('ngSpinnerBar', ['$rootScope', '$state',
        function($rootScope, $state) {
            return {
                link: function(scope, element, attrs) {
                    // by defult hide the spinner bar
                    element.addClass('hide'); // hide spinner bar by default

                    // display the spinner bar whenever the route changes(the content part started loading)
                    $rootScope.$on('$stateChangeStart', function() {
                        element.removeClass('hide'); // show spinner bar
                        Layout.closeMainMenu();
                    });

                    // hide the spinner bar on rounte change success(after the content loaded)
                    $rootScope.$on('$stateChangeSuccess', function(event) {
                        element.addClass('hide'); // hide spinner bar
                        $('body').removeClass('page-on-load'); // remove page loading indicator
                        Layout.setAngularJsMainMenuActiveLink('match', null, event.currentScope.$state); // activate selected link in the sidebar menu
                    
                        // auto scorll to page top
                        setTimeout(function () {
                            App.scrollTop(); // scroll to the top on content load
                        }, $rootScope.settings.layout.pageAutoScrollOnLoad);     
                    });

                    // handle errors
                    $rootScope.$on('$stateNotFound', function() {
                        element.addClass('hide'); // hide spinner bar
                    });

                    // handle errors
                    $rootScope.$on('$stateChangeError', function() {
                        element.addClass('hide'); // hide spinner bar
                    });
                }
            };
        }
    ])

    // Handle global LINK click
    app.directive('a', function() {
        return {
            restrict: 'E',
            link: function(scope, elem, attrs) {
                if (attrs.ngClick || attrs.href === '' || attrs.href === '#') {
                    elem.on('click', function(e) {
                        e.preventDefault(); // prevent link click for above criteria
                    });
                }
            }
        };
    });

    // Handle Dropdown Hover Plugin Integration
    app.directive('dropdownMenuHover', function () {
        return {
            link: function (scope, elem) {
                elem.dropdownHover();
            }
        };  
    });

    // lodash
    // allow DI for use in controllers, unit tests
    app.constant('_', window._);

    app.run(['$state', '$rootScope', '$location', '$auth', 'globalizeWrapper', 'amMoment', '$window', 'settings', function($state, $rootScope, $location, $auth, globalizeWrapper, amMoment, $window, settings) {

        //kendo.culture("vi-VN");

        // kendo-date-picker config
        //$rootScope.datePickerConfig = {
        //   format: "dd/MM/yyyy",
        //   parseFormats: ["yyyy-MM-dd", "dd/MM/yyyy", "yyyy/MM/dd"],
        //};

        //Google Analytics 
        //http://jasonwatmore.com/post/2015/11/07/angularjs-google-analytics-with-the-ui-router
        $window.ga('create', 'UA-111883091-1', 'auto');
        $rootScope.$on('$stateChangeSuccess', function (event) {
            $window.ga('send', 'pageview', $location.path());
        });

        $rootScope.isAuthenticated = function() {
            var _isAuthenticated = $auth.isAuthenticated();

            if (_isAuthenticated) {
                if ($rootScope.currentUser == null && $window.localStorage.getItem("currentUser") != null){
                    $rootScope.currentUser = JSON.parse($window.localStorage.getItem("currentUser"));
                }
            } else {
                $rootScope.currentUser = null;
                $window.localStorage.removeItem("currentUser");
            }
            return _isAuthenticated;
        };
        
        //You can switch locale at any time, just call globalizeWrapper.setLocale('foo') in your controller.
        globalizeWrapper.loadLocales(['vi', 'en']); // the first one is activated

        $rootScope.$on('GlobalizeLoadSuccess', function() {
            //console.log("GlobalizeLoadSuccess"); 
        });

        $rootScope.$on('GlobalizeLocaleChanged', function() {
            //console.log("globalizeWrapper.getLocale() = " + globalizeWrapper.getLocale());
            Globalize.locale(globalizeWrapper.getLocale());
        });

        $rootScope.$state = $state; // state to be accessed from view
        $rootScope.$settings = settings; // state to be accessed from view
        
        // lodash
        // use in views, ng-repeat="x in _.range(3)"
        $rootScope._ = window._;
    }]);

    angular.isUndefinedOrNull = function(val) {
        return angular.isUndefined(val) || val === null;
    }

    // Bootstrap Angular when DOM is ready
    angularAMD.bootstrap(app);

    return app;
});