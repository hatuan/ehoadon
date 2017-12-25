/**
 * Created by tuanha-01 on 5/13/2016.
 */
"use strict";

define(['angularAMD', 'jquery', 'ajaxService', 'alertsService', 'select2', 'eInvoiceService', 'eInvoiceCustomerService', 'eInvoiceItemService', 'eInvoiceItemUomService'], function(angularAMD, $) {
    var injectParams = ['$scope', '$rootScope', '$state', '$auth', 'moment', '$uibModal', '$uibModalInstance', 'ajaxService', 'alertsService', 'eInvoiceService', 'eInvoiceCustomerService', 'eInvoiceItemService', 'eInvoiceItemUomService', '$stateParams', '$confirm', 'Constants', 'editInvoice'];

    var invoiceMaintenanceController = function($scope, $rootScope, $state, $auth, moment, $uibModal, $uibModalInstance, ajaxService, alertsService, eInvoiceService, eInvoiceCustomerService, eInvoiceItemService, eInvoiceItemUomService, $stateParams, $confirm, Constants, editInvoice) {
       
        $scope.initializeController = function() {
            $scope.Constants = Constants;
            $scope.EditInvoice = editInvoice;

            if (angular.isUndefinedOrNull($scope.EditInvoice.ID)) {
                $scope.EditInvoice.Status = $scope.Constants.Status[1].Code;
                $scope.EditInvoice.RecCreatedByID = $rootScope.currentUser.ID;
                $scope.EditInvoice.RecCreatedByUser = $rootScope.currentUser.Name;
                $scope.EditInvoice.RecCreated = new Date();
                $scope.EditInvoice.RecModifiedByID = $rootScope.currentUser.ID;
                $scope.EditInvoice.RecModifiedByUser = $rootScope.currentUser.Name;
                $scope.EditInvoice.RecModified = new Date();

                $scope.EditInvoice.InvoiceLines = [];
            }

            if ($scope.EditInvoice.InvoiceLines.length == null)
                $scope.EditInvoice.InvoiceLines.length = 0;

            for(var i = $scope.EditInvoice.InvoiceLines.length + 1; i <= 10; i ++)
            {
                var invoiceLine = $scope.createInvoiceLineObject();

                $scope.EditInvoice.InvoiceLines.push(invoiceLine);
            }
        };

        $scope.$watch('$viewContentLoaded', 
            function() { 
                setTimeout(function() {
                    $('#CustomerID').select2({
                        ajax: {
                            url: '/api/autocomplete',
                            tags: true, 
                            data: function (params) {
                              var query = {
                                term: params.term || this.select2('data')[0].text,
                                page: params.page,
                                object:'ehd_customer'
                              }
                        
                              // Query parameters will be ?term=[term]&object=public
                              return query;
                            },
                            beforeSend: function (xhr) {   //Include the bearer token in header
                                xhr.setRequestHeader("Authorization", $auth.getToken());
                            },
                            processResults: function (data) {
                                var mappedItems = null;
                                mappedItems = $.map(data, function (obj) {
                                    obj.id = obj.id || obj["ID"];
                                    obj.text = obj.text || obj["Code"];
                                    obj.description = obj.description || obj["Description"];

                                    return obj;
                                });

                                return {
                                  results: mappedItems
                                };
                            }
                        },
                        dropdownCssClass : 'big-dropdown-width',
                        theme: "bootstrap",
                        templateResult : function (result) { 
                            if (result.loading) 
                                return "Searching...";
                            return result.text + " - " + result.description; 
                        }
                    }).on('select2:select', function (e) {
                        var data = e.params.data;
                        $scope.updateCustomer(data.id);
                    });

                    $("[name='ItemCode[]']").select2({
                        ajax: {
                            url: '/api/autocomplete',
                            tags: true, 
                            data: function (params) {
                              var query = {
                                term: params.term || this.select2('data')[0].text,
                                page: params.page,
                                object:'ehd_item'
                              }
                        
                              // Query parameters will be ?term=[term]&object=public
                              return query;
                            },
                            beforeSend: function (xhr) {   //Include the bearer token in header
                                xhr.setRequestHeader("Authorization", $auth.getToken());
                            },
                            processResults: function (data) {
                                var mappedItems = null;
                                mappedItems = $.map(data, function (obj) {
                                    obj.id = obj.id || obj["ID"];
                                    obj.text = obj.text || obj["Code"];
                                    obj.description = obj.description || obj["Description"];

                                    return obj;
                                });

                                return {
                                  results: mappedItems
                                };
                            }
                        },
                        dropdownCssClass : 'big-dropdown-width',
                        theme: "bootstrap",
                        templateResult : function (result) { 
                            if (result.loading) 
                                return "Searching...";
                            return result.text + " - " + result.description; 
                        }
                    }).on('select2:select', function (e) {
                        var data = e.params.data;
                        $scope.updateItem(data.id, angular.element(e.target).scope().invoiceLine);
                    });

                    $("[name='UomID[]").select2({
                        ajax: {
                            url: '/api/autocomplete',
                            tags: true, 
                            data: function (params) {
                              var query = {
                                term: params.term || this.select2('data')[0].text,
                                page: params.page,
                                object:'ehd_item_uom'
                              }
                        
                              // Query parameters will be ?term=[term]&object=public
                              return query;
                            },
                            beforeSend: function (xhr) {   //Include the bearer token in header
                                xhr.setRequestHeader("Authorization", $auth.getToken());
                            },
                            processResults: function (data) {
                                var mappedItems = null;
                                mappedItems = $.map(data, function (obj) {
                                    obj.id = obj.id || obj["ID"];
                                    obj.text = obj.text || obj["Code"];
                                    obj.description = obj.description || obj["Description"];

                                    return obj;
                                });

                                return {
                                  results: mappedItems
                                };
                            }
                        },
                        dropdownCssClass : 'big-dropdown-width',
                        theme: "bootstrap",
                        templateResult : function (result) { 
                            if (result.loading) 
                                return "Searching...";
                            return result.text + " - " + result.description; 
                        }
                    });

                }, 0);    
        });

        $scope.validationOptions = {
            rules: {
                "InvoiceType": {
                    required: true
                },
                "NumberForm2": {
                    required: true
                },
                "NumberForm3": {
                    required: true
                },
                "SymbolPart1": {
                    required: true
                },
                "SymbolPart2": {
                    required: true
                },
                "InvoiceForm": {
                    required: true
                },
            }
        };

        $scope.ok = function(form) {
            if (form.validate()) {
                var _postInvoice = new Object();
                $scope.EditInvoice.NumberForm3 = ("000" + $scope.EditInvoice.NumberForm3).substring($scope.EditInvoice.NumberForm3.length);
                $scope.EditInvoice.NumberForm = $scope.EditInvoice.InvoiceType + $scope.EditInvoice.NumberForm2 + "/" + $scope.EditInvoice.NumberForm3;
                $scope.EditInvoice.Symbol = $scope.EditInvoice.SymbolPart1 + "/" + $scope.EditInvoice.SymbolPart2 + $scope.EditInvoice.InvoiceForm;

                if($scope.EditInvoice.ID == "") {
                    $scope.EditInvoice.ID = null;
                    $scope.EditInvoice.RecCreatedByID = $rootScope.currentUser.ID;
                    $scope.EditInvoice.RecCreated = new Date();
                    $scope.EditInvoice.RecModifiedByID = $rootScope.currentUser.ID;
                    $scope.EditInvoice.RecModified = new Date();

                    _postInvoice = $scope.EditInvoice;
                    _postInvoice.RecCreated = new moment($scope.EditInvoice.RecCreated).unix();
                    _postInvoice.RecModified = new moment($scope.EditInvoice.RecModified).unix();
                } else {
                    $scope.EditInvoice.RecModifiedByID = $rootScope.currentUser.ID;
                    $scope.EditInvoice.RecModified = new Date();

                    _postInvoice = $scope.EditInvoice;
                    _postInvoice.RecCreated = new moment($scope.EditInvoice.RecCreated).unix();
                    _postInvoice.RecModifiedByID = $rootScope.currentUser.ID;
                    _postInvoice.RecModified = new moment($scope.EditInvoice.RecModified).unix();
                }
                
                eInvoiceService.updateInvoice(_postInvoice, $scope.invoiceUpdateCompleted, $scope.invoiceUpdateError)
            }
        };
        
        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.invoiceUpdateCompleted = function(response, status) {
            var _result = new Object();
            _result.SelectReports = false;
            _result.EditInvoice = $scope.EditInvoice;

            $uibModalInstance.close(_result);
        };

        $scope.invoiceUpdateError = function(response, status) {
            alertsService.RenderErrorMessage(response.Error);
        };

        $scope.createInvoiceLineObject = function() {
            
            var invoiceLine = new Object();
            invoiceLine.InvoiceID = $scope.EditInvoice.ID;
            invoiceLine.LineNo = $scope.EditInvoice.InvoiceLines.length;
            invoiceLine.ID = $scope.EditInvoice.ID;
            invoiceLine.Description = '';
            invoiceLine.Vat = $scope.Constants.VatTypes[0].Code;

            return invoiceLine;
        }

        $scope.addLine = function() {
            var invoiceLine = $scope.createInvoiceLineObject();

            $scope.EditInvoice.InvoiceLines.push(invoiceLine);
        };

        $scope.updateCustomer = function(customerID) {
            eInvoiceCustomerService.getCustomer({ID:customerID}, 
                function(response, status) { //success
                    var _customer = response.Data.eInvoiceCustomer;
                    $scope.EditInvoice.CustomerVatNumber = _customer.VatNumber;
                    $scope.EditInvoice.CustomerName = _customer.Description;
                    $scope.EditInvoice.CustomerAddress = _customer.Address;
                    $scope.EditInvoice.CustomerContactName = _customer.ContactName;
                    $scope.EditInvoice.CustomerContactName = _customer.ContactName;
                    $scope.EditInvoice.CustomerBankAccount = _customer.BankAccount;
                    $scope.EditInvoice.CustomerBankName = _customer.BankName;
                },
                function(response) { //error

                })
        };

        $scope.updateItem = function(_ID, invoiceLine) {
            eInvoiceItemService.getItem({ID : _ID}, 
                function(response, status) { //success
                    var _item = response.Data.eInvoiceItem;
                    invoiceLine.Description = _item.Description;
  
                    var newOption = new Option(_item.UomCode, _item.UomID, false, false);
                    $('#UomID_' + invoiceLine.LineNo).empty().append(newOption).trigger('change');
                },
                function(response) { //error

                })
        };
    };

    invoiceMaintenanceController.$inject = injectParams;
    angularAMD.controller('eInvoiceMaintenanceController', invoiceMaintenanceController);
});