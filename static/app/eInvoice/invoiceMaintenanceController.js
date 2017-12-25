/**
 * Created by tuanha-01 on 5/13/2016.
 */
"use strict";

define(['angularAMD', 'jquery', 'bignumber', 'ajaxService', 'alertsService', 'select2', 'eInvoiceService', 'eInvoiceFormReleaseService', 'eInvoiceCustomerService', 'eInvoiceItemService', 'eInvoiceItemUomService'], function(angularAMD, $, BigNumber) {
    var injectParams = ['$scope', '$rootScope', '$state', '$auth', 'moment', '$uibModal', '$uibModalInstance', 'ajaxService', 'alertsService', 'eInvoiceFormReleaseService', 'eInvoiceService', 'eInvoiceCustomerService', 'eInvoiceItemService', 'eInvoiceItemUomService', '$stateParams', '$confirm', 'Constants', 'editInvoice'];

    var invoiceMaintenanceController = function($scope, $rootScope, $state, $auth, moment, $uibModal, $uibModalInstance, ajaxService, alertsService, eInvoiceService, eInvoiceFormReleaseService, eInvoiceCustomerService, eInvoiceItemService, eInvoiceItemUomService, $stateParams, $confirm, Constants, editInvoice) {
       
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

            /*
            if ($scope.EditInvoice.InvoiceLines.length == null || $scope.EditInvoice.InvoiceLines.length == 0) {
                var invoiceLine = $scope.createInvoiceLineObject();
                $scope.EditInvoice.InvoiceLines.push(invoiceLine);
            }
            */
            /*
            if ($scope.EditInvoice.InvoiceLines.length == null) 
                $scope.EditInvoice.InvoiceLines.length == 0;

            for(var i = $scope.EditInvoice.InvoiceLines.length + 1; i <= 10; i ++)
            {
                var invoiceLine = $scope.createInvoiceLineObject();
                $scope.EditInvoice.InvoiceLines.push(invoiceLine);
            }
            */
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
/*
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
*/
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
            
            var _invoiceLine = new Object();
            _invoiceLine.InvoiceID = $scope.EditInvoice.ID;
            //_invoiceLine.LineNo = angular.isUndefinedOrNull($scope.EditInvoice.InvoiceLines.length) ? 1 : $scope.EditInvoice.InvoiceLines.length + 1;
            _invoiceLine.Quantity = new BigNumber(0);
            _invoiceLine.UnitPrice = new BigNumber(0);
            _invoiceLine.Amount = new BigNumber(0);
            _invoiceLine.Vat = $scope.Constants.VatTypes[0].Code;
            _invoiceLine.AmountVat = new BigNumber(0);
            _invoiceLine.AmountPayment = new BigNumber(0);

            return _invoiceLine;
        }

        $scope.addLine = function() {
            var _invoiceLine = $scope.createInvoiceLineObject();

            $scope.EditInvoice.InvoiceLines.push(_invoiceLine);

            /*
            setTimeout(function() {
                $scope.SetItemSelect2ToObject("#ItemCode_" + _invoiceLine.LineNo);
                $scope.SetItemUomSelect2ToObject("#UomID_" + _invoiceLine.LineNo);

                $("#ItemCode_" + _invoiceLine.LineNo).select2('open');
            }, 0);
            */
        };

        $scope.SetItemSelect2ToObject = function(objectString) {
            $(objectString).select2({
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
        }

        $scope.SetItemUomSelect2ToObject = function(objectString) {
            $(objectString).select2({
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
        }

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
            eInvoiceItemService.getItem(
                {ID : _ID}, 
                function(response, status) { //success
                    var _item = response.Data.eInvoiceItem;
                    invoiceLine.Description = _item.Description;
                    invoiceLine.Vat = _item.Vat;
                    invoiceLine.Quantity = _item.Quantity;
                    invoiceLine.UnitPrice = _item.UnitPrice;
                    invoiceLine.Amount = 0;
                    invoiceLine.AmountVat = 0;
                    invoiceLine.AmountPayment = 0;
                    if(invoiceLine.Quantity != 0 && invoiceLine.UnitPrice) {
                        var qty = new BigNumber(invoiceLine.Quantity);
                        var price = new BigNumber(invoiceLine.UnitPrice);
                        var amount =  price.times(qty);
                        invoiceLine.Amount = amount;

                        if(invoiceLine.Vat > 0) {
                            var vatAmount = amount.dividedBy(100).times(invoiceLine.Vat).round();
                            invoiceLine.AmountVat = vatAmount;
                            var amountPayment = amount.plus(vatAmount);
                            invoiceLine.AmountPayment = amountPayment;
                        }
                    }
                    $scope.updateTotal();

                    var newOption = new Option(_item.UomCode, _item.UomID, false, false);
                    $('#UomID_' + invoiceLine.LineNo).empty().append(newOption);
                },
                function(response) { //error
                })
        };

        $scope.updateTotal = function() {
            var totalAmount = new BigNumber(0);
            var totalAmountNoVat = new BigNumber(0);
            var totalAmountVat0 = new BigNumber(0);
            var totalAmountVat5 = new BigNumber(0);
            var totalAmountVat10 = new BigNumber(0);
            var totalVat = new BigNumber(0);
            var totalVat5 = new BigNumber(0);
            var totalVat10 = new BigNumber(0);
            var totalPayment = new BigNumber(0);

            for(var i = 0; i < $scope.EditInvoice.InvoiceLines.length; i ++)
            {
                var invoiceLine = $scope.EditInvoice.InvoiceLines[i];
                var amount = new BigNumber(invoiceLine.Amount);
                
                var amountNoVat = new BigNumber(0);
                var amountVat0 = new BigNumber(0);
                var amountVat5 = new BigNumber(0);
                var amountVat10 = new BigNumber(0);
                switch(invoiceLine.Vat)
                {
                    case -1:
                        amountNoVat = new BigNumber(invoiceLine.Amount);
                        break;
                    case 0:   
                        amountVat0 = new BigNumber(invoiceLine.Amount);
                        break; 
                    case 5:   
                        amountVat5 = new BigNumber(invoiceLine.Amount);
                        break; 
                    case 10:   
                        amountVat10 = new BigNumber(invoiceLine.Amount);
                        break; 
                }

                var vat = new BigNumber(invoiceLine.AmountVat);
                var vat5 = new BigNumber(0);
                var vat10 = new BigNumber(0);
                switch(invoiceLine.Vat)
                {
                    case 5:   
                        vat5 = new BigNumber(invoiceLine.AmountVat);
                        break; 
                    case 10:   
                        vat10 = new BigNumber(invoiceLine.AmountVat);
                        break; 
                }

                var amountPayment = new BigNumber(invoiceLine.AmountPayment);
                
                totalAmount =totalAmount.plus(amount);
                totalAmountNoVat    = totalAmountNoVat.plus(amountNoVat);
                totalAmountVat0     = totalAmountVat0.plus(amountVat0);
                totalAmountVat5     = totalAmountVat5.plus(amountVat5);
                totalAmountVat10    = totalAmountVat10.plus(amountVat10);

                totalVat    = totalVat.plus(vat);
                totalVat5   = totalVat5.plus(vat5);
                totalVat10  = totalVat10.plus(vat10);

                totalPayment  = totalPayment.plus(amountPayment);
            }

            $scope.EditInvoice.TotalAmount = totalAmount;
            $scope.EditInvoice.TotalAmountNoVat = totalAmountNoVat;
            $scope.EditInvoice.TotalAmountVat0 = totalAmountVat0;
            $scope.EditInvoice.TotalAmountVat5 = totalAmountVat5;
            $scope.EditInvoice.TotalAmountVat10 = totalAmountVat10;

            $scope.EditInvoice.TotalVat = totalVat;
            $scope.EditInvoice.TotalVat5 = totalVat5;
            $scope.EditInvoice.TotalVat10 = totalVat10;

            $scope.EditInvoice.TotalPayment = totalPayment;
        }
    };

    invoiceMaintenanceController.$inject = injectParams;
    angularAMD.controller('eInvoiceMaintenanceController', invoiceMaintenanceController);
});