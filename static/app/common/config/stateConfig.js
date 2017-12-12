/**
 * Created by tuanha-01 on 5/11/2016.
 */
define(['angularAMD'], function (angularAMD) {

    var injectParams = ['$stateProvider', '$urlRouterProvider', '$authProvider'];
    stateConfig = function ($stateProvider, $urlRouterProvider, $authProvider) {

        $urlRouterProvider.otherwise("/");

        $stateProvider
            .state('login', {
                url: '/login',
                views: {
                    "master": angularAMD.route({
                        templateUrl: 'app/user/login.html',
                        controller: 'LoginController',
                        controllerUrl: 'app/user/loginController',
                    })
                },
                resolve: {
                    skipIfAuthenticated: _skipIfAuthenticated
                }
            })
            .state('logoff', {
                url: '/logoff',
                views: {
                    "master": angularAMD.route({
                        templateUrl: 'app/main/home.html',
                        controller: 'HomeController',
                        controllerUrl: 'app/main/homeController',
                    })
                },
                onEnter: function($auth){
                    $auth.logout();
                    /*
                    $auth.logout().then(function(result){
                        setTimeout(function () {
                            $state.go('home');
                        }, 10);
                        defer.resolve();
                    });
                    */
                },
                resolve: {
                    skipIfAuthenticated: _skipIfAuthenticated
                }
            })
            .state('home', {
                url: '/',
                views: {
                    "master": angularAMD.route({
                        templateUrl: 'app/main/home.html',
                        controller: 'HomeController',
                        controllerUrl: 'app/main/homeController',
                    })
                },
                resolve: {
                    skipIfAuthenticated: _skipIfAuthenticated
                }
            })
            .state('preference', {
                url: '/preference',
                views: {
                    "master": angularAMD.route({
                        templateUrl: 'app/user/preference.html',
                        controller: 'PreferenceController',
                        controllerUrl: 'app/user/preferenceController',
                    })
                },
                resolve: {
                    redirectIfNotAuthenticated: _redirectIfNotAuthenticated,
                }
            })
            .state('eInvoiceCustomers', {
                url: "/eInvoiceCustomers",
                views: {
                    "master": angularAMD.route({
                        templateUrl: 'app/eInvoice/customers.html',
                        controller: 'eInvoiceCustomersController',
                        controllerUrl: 'app/eInvoice/customersController',
                    })
                },
                params: {
                    customerID: null
                },
                resolve: {
                    redirectIfNotAuthenticated: _redirectIfNotAuthenticated,
                }
            })
            .state('eInvoiceItemUoms', {
                url: "/eInvoiceItemUoms",
                views: {
                    "master": angularAMD.route({
                        templateUrl: 'app/eInvoice/itemUoms.html',
                        controller: 'eInvoiceItemUomsController',
                        controllerUrl: 'app/eInvoice/itemUomsController',
                    })
                },
                params: {
                    itemUomID: null
                },
                resolve: {
                    redirectIfNotAuthenticated: _redirectIfNotAuthenticated,
                }
            })
            .state('eInvoiceItems', {
                url: "/eInvoiceItems",
                views: {
                    "master": angularAMD.route({
                        templateUrl: 'app/eInvoice/items.html',
                        controller: 'eInvoiceItemsController',
                        controllerUrl: 'app/eInvoice/itemsController',
                    })
                },
                params: {
                    itemID: null
                },
                resolve: {
                    redirectIfNotAuthenticated: _redirectIfNotAuthenticated,
                }
            })
            .state('eInvoiceFormTypes', {
                url: "/eInvoiceFormTypes",
                views: {
                    "master": angularAMD.route({
                        templateUrl: 'app/eInvoice/formTypes.html',
                        controller: 'eInvoiceFormTypesController',
                        controllerUrl: 'app/eInvoice/formTypesController',
                    })
                },
                resolve: {
                    redirectIfNotAuthenticated: _redirectIfNotAuthenticated,
                }
            })
            ;

        function _skipIfAuthenticated($q, $state, $auth) {
            var defer = $q.defer();
            if ($auth.isAuthenticated()) {
                defer.resolve(); // always return defer.resolve()
            } else {
                defer.resolve(); // always return defer.resolve()
            }
            return defer.promise;
        }

        function _redirectIfNotAuthenticated($q, $state, $auth) {
            var defer = $q.defer();
            if ($auth.isAuthenticated()) {
                defer.resolve(); // always return defer.resolve()
            } else {
                setTimeout(function () {
                    $state.go('login');
                }, 10);
                defer.resolve(); // always return defer.resolve()
            }
            return defer.promise;
        }
    }

    stateConfig.$inject = injectParams;

    return stateConfig;
});