/**
 * Created by tuanha-01 on 5/13/2016.
 */
"use strict";

define(['angularAMD', 'jquery', 'bignumber', 'ajaxService', 'alertsService', 'eInvoiceService', 'eInvoiceFormReleaseService', 'eInvoiceCustomerService', 'eInvoiceItemService', 'eInvoiceItemUomService'], function(angularAMD, $, BigNumber) {
    var injectParams = ['$scope', '$rootScope', '$state', '$auth', '$filter' , 'moment', '$uibModal', '$uibModalInstance', 'ajaxService', 'alertsService', 'eInvoiceService', 'eInvoiceFormReleaseService', 'eInvoiceCustomerService', 'eInvoiceItemService', 'eInvoiceItemUomService', '$stateParams', '$confirm', 'Constants', 'editInvoice'];

    var invoiceMaintenanceController = function($scope, $rootScope, $state, $auth, $filter, moment, $uibModal, $uibModalInstance, ajaxService, alertsService, eInvoiceService, eInvoiceFormReleaseService, eInvoiceCustomerService, eInvoiceItemService, eInvoiceItemUomService, $stateParams, $confirm, Constants, editInvoice) {
       
        $scope.initializeController = function() {
            $scope.Constants = Constants;
            $scope.eInvoiceFormTypes = [];
            $scope.EditInvoice = editInvoice;
            $scope.EditInvoice.InvoiceLines = [];
            $scope.selectViewReport = false;

            if (angular.isUndefinedOrNull($scope.EditInvoice.ID)) {
                $scope.EditInvoice.Status = $scope.Constants.Status[1].Code;
                $scope.EditInvoice.RecCreatedByID = $rootScope.currentUser.ID;
                $scope.EditInvoice.RecCreatedByUser = $rootScope.currentUser.Name;
                $scope.EditInvoice.RecCreated = new Date();
                $scope.EditInvoice.RecModifiedByID = $rootScope.currentUser.ID;
                $scope.EditInvoice.RecModifiedByUser = $rootScope.currentUser.Name;
                $scope.EditInvoice.RecModified = new Date();

                $scope.EditInvoice.InvoiceLines = [];
            } else {
                
            }

            $scope.getFormReleases();
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

                    var newOption = new Option($scope.EditInvoice.CustomerCode, $scope.EditInvoice.CustomerID, false, false);
                    $('#CustomerID').empty().append(newOption);
                }, 0);    
        }); //$scope.watch

        $scope.validationOptions = {
            rules: {
                "CustomerVatNumber": {
                    required: true
                },
                "CustomerName": {
                    required: true
                },
                "CustomerAddress": {
                    required: true
                }
            }
        };

        $scope.validationLinesOptions = {
            rules: {
                "Description[]": {
                    required: true
                }, 
                "Quantity[]": {
                    number: true
                }, 
                "UnitPrice[]": {
                    number: true
                }, 
                "Amount[]": {
                    number: true
                }, 
                "AmountVat[]": {
                    number: true
                }, 
                "AmountPayment[]": {
                    number: true
                }
            }
        };

        $scope.ok = function(form, formDetail, _selectViewReport) {
            if (form.validate() && formDetail.validate()) {
                
                var _post = new Object();
                if (angular.isUndefinedOrNull($scope.EditInvoice.ID)) {
                    $scope.EditInvoice.RecCreatedByID = $rootScope.currentUser.ID;
                    $scope.EditInvoice.RecCreated = new Date();
                    $scope.EditInvoice.RecModifiedByID = $rootScope.currentUser.ID;
                    $scope.EditInvoice.RecModified = new Date();

                    _post = $scope.EditInvoice;
                    _post.RecCreated = new moment($scope.EditInvoice.RecCreated).unix();
                    _post.RecModified = new moment($scope.EditInvoice.RecModified).unix();
                } else {
                    $scope.EditInvoice.RecModifiedByID = $rootScope.currentUser.ID;
                    $scope.EditInvoice.RecModified = new Date();

                    _post = $scope.EditInvoice;
                    _post.RecModified = new moment($scope.EditInvoice.RecModified).unix();
                }
                
                for (var i = 0, len = $scope.EditInvoice.InvoiceLines.length; i < len; i++) {
                    var invoiceLine = $scope.EditInvoice.InvoiceLines[i];
                    var _postInvoiceLine = _post.InvoiceLines[i];

                    if (angular.isUndefinedOrNull(invoiceLine.ID)) {
                        invoiceLine.RecCreatedByID = $rootScope.currentUser.ID;
                        invoiceLine.RecCreated = new Date();
                        invoiceLine.RecModifiedByID = $rootScope.currentUser.ID;
                        invoiceLine.RecModified = new Date();

                        _postInvoiceLine.RecCreated = new moment(invoiceLine.RecCreated).unix();
                        _postInvoiceLine.RecModified = new moment(invoiceLine.RecModified).unix();
                    } else {
                        invoiceLine.RecModifiedByID = $rootScope.currentUser.ID;
                        invoiceLine.RecModified = new Date();

                        _postInvoiceLine.RecModified = new moment(invoiceLine.RecModified).unix();
                    }
                }
                $scope.selectViewReport = _selectViewReport;
                eInvoiceService.updateInvoice(_post, $scope.invoiceUpdateCompleted, $scope.invoiceUpdateError)
            }
        };
        
        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.invoiceUpdateCompleted = function(response, status) {
            var _result = new Object();
            _result.EditInvoice = $scope.EditInvoice;
            _result.selectViewReport = $scope.selectViewReport;

            $uibModalInstance.close(_result);
        };

        $scope.invoiceUpdateError = function(response, status) {
            alertsService.RenderErrorMessage(response.Error);
        };

        $scope.getInvoice = function(_ID) {
            var invoiceInquiry = new Object();
            invoiceInquiry.ID = _ID
            eInvoiceService.getInvoice(
                invoiceInquiry, 
                function(response, status) { //success
                    $scope.EditInvoice = response.Data.eInvoice;
                    setTimeout(function() {
                        for(var i = 0, len = $scope.EditInvoice.InvoiceLines.length; i < len; i ++) {
                            var _invoiceLine = $scope.EditInvoice.InvoiceLines[i];
                            $scope.SetItemSelect2ToObject("#ItemID_" + _invoiceLine.LineNo);
                            $scope.SetItemUomSelect2ToObject("#UomID_" + _invoiceLine.LineNo);

                            var newOptionItem = new Option(_invoiceLine.ItemCode, _invoiceLine.ItemID, true, true);
                            $("#ItemID_" + _invoiceLine.LineNo).empty().append(newOptionItem);

                            var newOptionUom = new Option(_invoiceLine.UomCode, _invoiceLine.UomID, true, true);
                            $("#UomID_" + _invoiceLine.LineNo).empty().append(newOptionUom);
                        }
                    }, 100);
                },
                function(response) { //error
                    alertsService.RenderErrorMessage(response.Error);
                }
            )
        };

        $scope.getFormReleases = function() {
            var formReleaseInquiry = new Object();
            formReleaseInquiry.Search = "tax_authorities_status=1";
            formReleaseInquiry.SortExpression = 'release_date';
            formReleaseInquiry.SortDirection = 'ASC';

            eInvoiceFormReleaseService.getFormReleases(
                formReleaseInquiry, 
                function(response, status){
                    $scope.eInvoiceFormTypes = response.Data.eInvoiceFormReleases;
                    for (var i = 0, len = $scope.eInvoiceFormTypes.length; i < len; i++) {
                        $scope.eInvoiceFormTypes[i].ReleaseDate = new moment.unix($scope.eInvoiceFormTypes[i].ReleaseDate).toDate();
                        $scope.eInvoiceFormTypes[i].StartDate = new moment.unix($scope.eInvoiceFormTypes[i].StartDate).toDate();
        
                        $scope.eInvoiceFormTypes[i].Description = $filter('filter')($scope.Constants.InvoiceTypes, {Code:$scope.eInvoiceFormTypes[i].FormTypeInvoiceType})[0].Name + " - " + $scope.eInvoiceFormTypes[i].FormTypeNumberForm + " - " + $scope.eInvoiceFormTypes[i].FormTypeSymbol;
                        $scope.eInvoiceFormTypes[i].Description += " (From : " + $scope.eInvoiceFormTypes[i].ReleaseFrom + " - To : " + $scope.eInvoiceFormTypes[i].ReleaseTo + ")";
                    }

                    if (!angular.isUndefinedOrNull($scope.EditInvoice.ID))
                        $scope.getInvoice($scope.EditInvoice.ID);
                },
                function(response){
                    alertsService.RenderErrorMessage(response.Error);
                }
            );
        }; //$scope.getFormReleases

        $scope.createInvoiceLineObject = function() {
            var _invoiceLine = new Object();
            _invoiceLine.InvoiceID = $scope.EditInvoice.ID;
            _invoiceLine.Description = "";
            _invoiceLine.Quantity = new BigNumber(0);
            _invoiceLine.UnitPrice = new BigNumber(0);
            _invoiceLine.Amount = new BigNumber(0);
            _invoiceLine.Vat = $scope.Constants.VatTypes[0].Code;
            _invoiceLine.AmountVat = new BigNumber(0);
            _invoiceLine.AmountPayment = new BigNumber(0);

            _invoiceLine.Status = $scope.Constants.Status[1].Code;
            _invoiceLine.RecCreatedByID = $rootScope.currentUser.ID;
            _invoiceLine.RecCreatedByUser = $rootScope.currentUser.Name;
            _invoiceLine.RecCreated = new Date();
            _invoiceLine.RecModifiedByID = $rootScope.currentUser.ID;
            _invoiceLine.RecModifiedByUser = $rootScope.currentUser.Name;
            _invoiceLine.RecModified = new Date();

            return _invoiceLine;
        }

        $scope.addLine = function() {
            var _invoiceLine = $scope.createInvoiceLineObject();

            $scope.EditInvoice.InvoiceLines.push(_invoiceLine);

            setTimeout(function() {
                $scope.SetItemSelect2ToObject("#ItemID_" + _invoiceLine.LineNo);
                $scope.SetItemUomSelect2ToObject("#UomID_" + _invoiceLine.LineNo);

                $("#ItemID_" + _invoiceLine.LineNo).select2('open');
            }, 0);
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
                        var amount =  price.times(qty).round();
                        invoiceLine.Amount = amount;

                        if(invoiceLine.Vat > 0) {
                            var amountVat = amount.dividedBy(100).times(invoiceLine.Vat).round();
                            invoiceLine.AmountVat = amountVat;
                            var amountPayment = amount.plus(amountVat);
                            invoiceLine.AmountPayment = amountPayment;
                        }
                    }
                    $scope.updateTotal();
                    invoiceLine.UomID = _item.UomID;

                    setTimeout(function() {
                        var newOption = new Option(_item.UomCode, _item.UomID, true, true);
                        $('#UomID_' + invoiceLine.LineNo).empty().append(newOption);
                    }, 0);
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
        }; //$scope.updateTotal

        $scope.validLine = function(_colName, _invoiceLine) {
            var qty = new BigNumber(_invoiceLine.Quantity);
            var price = new BigNumber(_invoiceLine.UnitPrice);
            var amount = new BigNumber(_invoiceLine.Amount);
            var vatType = _invoiceLine.Vat;
            var amountVat = new BigNumber(_invoiceLine.AmountVat);
            var amountPayment = new BigNumber(_invoiceLine.AmountPayment);

            switch(_colName) {
                case 'ItemCode':
                    break;
                case 'Quantity':
                    amount = price.times(qty).round();
                    amountVat = amount.dividedBy(100).times(vatType).round();
                    amountPayment = amount.plus(amountVat);
                    break;
                case 'UnitPrice':
                    amount = price.times(qty).round();
                    amountVat = amount.dividedBy(100).times(vatType).round();
                    amountPayment = amount.plus(amountVat);
                    break;
                case 'VatType':
                    if(vatType > 0) {
                        amountVat = amount.dividedBy(100).times(vatType).round();
                    } else {
                        amountVat = new BigNumber(0);
                    }
                    amountPayment = amount.plus(amountVat);
                    break;
                case 'AmountVat':
                    amountPayment = amount.plus(amountVat);
                    break;
                case 'AmountPayment':
                    break;
            }

            _invoiceLine.Amount = amount;
            _invoiceLine.AmountVat = amountVat;
            _invoiceLine.AmountPayment = amountPayment;
            $scope.updateTotal();
        };//$scope.validLine

    };

    invoiceMaintenanceController.$inject = injectParams;
    angularAMD.controller('eInvoiceMaintenanceController', invoiceMaintenanceController);
});