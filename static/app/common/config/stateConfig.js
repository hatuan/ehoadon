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
                data: {pageTitle: ''},
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
                data: {pageTitle: ''},
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
                data: {pageTitle: 'Dashboard'},
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
                data: {pageTitle: 'Preference'},
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
            .state('eInvoiceClient', {
                url: "/eInvoiceClient",
                data: {pageTitle: 'Client Information'},
                views: {
                    "master": angularAMD.route({
                        templateUrl: 'app/eInvoice/clientMaintenance.html',
                        controller: 'eInvoiceClientMaintenanceController',
                        controllerUrl: 'app/eInvoice/clientMaintenanceController',
                    })
                },
                params: {
                    customerID: null
                },
                resolve: {
                    redirectIfNotAuthenticated: _redirectIfNotAuthenticated,
                }
            })
            .state('eInvoiceCustomers', {
                url: "/eInvoiceCustomers",
                data: {pageTitle: 'Customers List'},
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
                data: {pageTitle: 'Uoms List'},
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
                data: {pageTitle: 'Items List'},
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
                data: {pageTitle: 'FormTypes List'},
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
            .state('eInvoiceFormReleases', {
                url: "/eInvoiceFormReleases",
                data: {pageTitle: 'FormReleases List'},
                views: {
                    "master": angularAMD.route({
                        templateUrl: 'app/eInvoice/formReleases.html',
                        controller: 'eInvoiceFormReleasesController',
                        controllerUrl: 'app/eInvoice/formReleasesController',
                    })
                },
                resolve: {
                    redirectIfNotAuthenticated: _redirectIfNotAuthenticated,
                }
            })
            .state('eInvoices', {
                url: "/eInvoices",
                data: {pageTitle: 'Invoices List'},
                views: {
                    "master": angularAMD.route({
                        templateUrl: 'app/eInvoice/invoices.html',
                        controller: 'eInvoicesController',
                        controllerUrl: 'app/eInvoice/invoicesController',
                    })
                },
                resolve: {
                    redirectIfNotAuthenticated: _redirectIfNotAuthenticated,
                    Preference: _getPreference,
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

        function _getPreference($q, $http, $rootScope, moment) {
            var defer = $q.defer();
            if($rootScope.Preference == null  || $rootScope.Preference == undefined) {
                $http({ method: 'GET', url: '/api/user/preference' })
                    .success(function(response){
                        $rootScope.Preference = response.Data.Preference;
                        $rootScope.Preference.WorkingDateUnix = $rootScope.Preference.WorkingDate;
                        $rootScope.Preference.WorkingDate = new moment.unix($rootScope.Preference.WorkingDate).toDate();
                        
                        defer.resolve($rootScope.Preference);
                    });
            } else {
                defer.resolve($rootScope.Preference);
            }

            return defer.promise;
        }
    }

    stateConfig.$inject = injectParams;

    return stateConfig;
});