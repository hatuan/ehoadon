/**
 * Created by tuanha-01 on 5/13/2016.
 */
"use strict";

define(['angularAMD', 'jquery', 'bignumber', 'ajaxService', 'alertsService', 'eInvoiceService', 'eInvoiceFormReleaseService', 'eInvoiceCustomerService', 'eInvoiceItemService', 'eInvoiceItemUomService', 'eInvoiceSignService'], function(angularAMD, $, BigNumber) {
    var injectParams = ['$scope', '$rootScope', '$state', '$auth', '$filter' , 'moment', '$uibModal', '$uibModalInstance', 'ajaxService', 'alertsService', 'eInvoiceService', 'eInvoiceFormReleaseService', 'eInvoiceCustomerService', 'eInvoiceItemService', 'eInvoiceItemUomService', 'eInvoiceSignService', '$stateParams', '$confirm', 'Constants', 'editInvoice'];

    var invoiceMaintenanceController = function($scope, $rootScope, $state, $auth, $filter, moment, $uibModal, $uibModalInstance, ajaxService, alertsService, eInvoiceService, eInvoiceFormReleaseService, eInvoiceCustomerService, eInvoiceItemService, eInvoiceItemUomService, eInvoiceSignService, $stateParams, $confirm, Constants, editInvoice) {
       
        $scope.initializeController = function() {
            $scope.Constants = Constants;
            $scope.FormReleases = [];
            $scope.EditInvoice = editInvoice;
            $scope.EditInvoice.InvoiceLines = editInvoice.InvoiceLines ? editInvoice.InvoiceLines : [];
            $scope.selectViewReport = false;
            $scope.documentChanged = false;
            $scope.documentState = $scope.Constants.DocumentStates.View;
            $scope.originalDocument = {};
debugger;
            if (angular.isUndefinedOrNull($scope.EditInvoice.ID)) {
                $scope.EditInvoice.InvoiceDate = $rootScope.Preference.WorkingDate;
                $scope.EditInvoice.Status = $scope.Constants.InvoiceStatus[0].Code;
                $scope.EditInvoice.RecCreatedByID = $rootScope.currentUser.ID;
                $scope.EditInvoice.RecCreatedByUser = $rootScope.currentUser.Name;
                $scope.EditInvoice.RecCreated = new Date();
                $scope.EditInvoice.RecModifiedByID = $rootScope.currentUser.ID;
                $scope.EditInvoice.RecModifiedByUser = $rootScope.currentUser.Name;
                $scope.EditInvoice.RecModified = new Date();

                $scope.documentState = $scope.Constants.DocumentStates.New;
            } else {
                //invoice se duoc lay tai $scope.getInvoice sau khi thuc hien $scope.getFormReleases();
            }

            $scope.getFormReleases();
        };

        $scope.isViewState = function() {
            return $scope.documentState === $scope.Constants.DocumentStates.View;
        }

        $scope.isEditState = function() {
            return ($scope.documentState === $scope.Constants.DocumentStates.Edit || $scope.documentState === $scope.Constants.DocumentStates.New);
        }

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
                "InvoiceDate": {
                    date: true,
                    required: true            
                },
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

        $scope.ok = function(form, formDetail) {
            if (form.validate() && formDetail.validate()) {
                
                var _post = {};
                if (angular.isUndefinedOrNull($scope.EditInvoice.ID)) {
                    $scope.EditInvoice.RecCreatedByID = $rootScope.currentUser.ID;
                    $scope.EditInvoice.RecCreated = new Date();
                    $scope.EditInvoice.RecModifiedByID = $rootScope.currentUser.ID;
                    $scope.EditInvoice.RecModified = new Date();
                } else {
                    $scope.EditInvoice.RecModifiedByID = $rootScope.currentUser.ID;
                    $scope.EditInvoice.RecModified = new Date();
                }
                _post = $.extend(true, {}, $scope.EditInvoice);
                _post.InvoiceDate = new moment(_post.InvoiceDate).unix();
                _post.OriginalInvoiceDate = new moment(_post.OriginalInvoiceDate).unix();
                _post.RecCreated = new moment($scope.EditInvoice.RecCreated).unix();
                _post.RecModified = new moment($scope.EditInvoice.RecModified).unix();
                
                for (var i = 0, len = $scope.EditInvoice.InvoiceLines.length; i < len; i++) {
                    var invoiceLine = $scope.EditInvoice.InvoiceLines[i];
                    var _postInvoiceLine = {};

                    if (angular.isUndefinedOrNull(invoiceLine.ID)) {
                        invoiceLine.RecCreatedByID = $rootScope.currentUser.ID;
                        invoiceLine.RecCreated = new Date();
                        invoiceLine.RecModifiedByID = $rootScope.currentUser.ID;
                        invoiceLine.RecModified = new Date();
                    } else {
                        invoiceLine.RecModifiedByID = $rootScope.currentUser.ID;
                        invoiceLine.RecModified = new Date();
                    }
                    _postInvoiceLine = $.extend(true, {}, invoiceLine);
                    _postInvoiceLine.RecCreated = new moment(invoiceLine.RecCreated).unix();
                    _postInvoiceLine.RecModified = new moment(invoiceLine.RecModified).unix();

                    _post.InvoiceLines[i] = _postInvoiceLine;
                }
                eInvoiceService.updateInvoice(_post, $scope.invoiceUpdateCompleted, $scope.invoiceUpdateError)
            }
        };

        $scope.invoiceUpdateCompleted = function(response, status) {
            var _result = {};
            _result = response.Data.eInvoice;
            _result.InvoiceDate = new moment.unix(_result.InvoiceDate).toDate();
            _result.RecCreated = new moment.unix(_result.RecCreated).toDate();
            _result.RecModified = new moment.unix(_result.RecModified).toDate();

            $scope.EditInvoice = $.extend(true, {}, _result);
            $scope.originalDocument = $.extend(true, {}, $scope.EditInvoice);
            $scope.documentState = $scope.Constants.DocumentStates.View;
            $scope.documentChanged = true;
        };

        $scope.invoiceUpdateError = function(response, status) {
            alertsService.RenderErrorMessage(response.Error);
        };

        $scope.report = function() {
            var _result = {};
            _result.EditInvoice = $scope.EditInvoice;
            _result.selectViewReport = true;

            $uibModalInstance.close(_result);
        }

        $scope.edit = function() {
            $scope.documentChanged = false;
            $scope.originalDocument = $.extend(true, {}, $scope.EditInvoice);
            $scope.documentState = $scope.Constants.DocumentStates.Edit;
        };
        
        $scope.cancel = function() {
            $scope.documentChanged = false;
            if ($scope.documentState == $scope.Constants.DocumentStates.New) {
                $uibModalInstance.dismiss('cancel');    
            } else {
                $scope.documentState = $scope.Constants.DocumentStates.View;
                //TODO : get document from server
                $scope.EditInvoice = $.extend(true, {}, $scope.originalDocument);
            }
        };

        $scope.close = function() {
            if(!$scope.documentChanged) {
                $uibModalInstance.dismiss('cancel');
            } else {
                var _result = {};
                _result.EditInvoice = $.extend(true, {}, $scope.EditInvoice);
                _result.selectViewReport = false;
                $uibModalInstance.close(_result);    
            }
        };

        $scope.signDocument = function() {
            var _signDocument = $.extend(true, {}, $scope.EditInvoice);
            eInvoiceSignService.SignDocument(_signDocument, $scope.signCompleted, $scope.signError)
        }

        $scope.signCompleted = function(response) {
            var _result = {};
            _result = response.Data.eInvoice;
            _result.InvoiceDate = new moment.unix(_result.InvoiceDate).toDate();
            _result.RecCreated = new moment.unix(_result.RecCreated).toDate();
            _result.RecModified = new moment.unix(_result.RecModified).toDate();

            $scope.EditInvoice = $.extend(true,  {}, _result);
            $scope.originalDocument = $.extend(true, {}, $scope.EditInvoice);
            $scope.documentChanged = true;

            alert('Document signed successfuly');
        };

        $scope.signError = function(response, status) {
            alert('Document signed error');
            alertsService.RenderErrorMessage(response.Error);
        };

        $scope.sendDocument = function() {
            var _result = {};
            _result.EditInvoice = $scope.EditInvoice;
            _result.selectSendDocument = true;

            $uibModalInstance.close(_result);
        }

        $scope.getInvoice = function(_ID) {
            var invoiceInquiry = new Object();
            invoiceInquiry.ID = _ID
            eInvoiceService.getInvoice(
                invoiceInquiry, 
                function(response, status) { //success
                    var _editInvoice = response.Data.eInvoice;
                    _editInvoice.InvoiceDate = new moment.unix(_editInvoice.InvoiceDate).toDate();
                    _editInvoice.RecCreated = new moment.unix(_editInvoice.RecCreated).toDate();
                    _editInvoice.RecModified = new moment.unix(_editInvoice.RecModified).toDate();
                    $scope.EditInvoice = _editInvoice;

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
                    $scope.FormReleases = response.Data.eInvoiceFormReleases;
                    for (var i = 0, len = $scope.FormReleases.length; i < len; i++) {
                        $scope.FormReleases[i].ReleaseDate = new moment.unix($scope.FormReleases[i].ReleaseDate).toDate();
                        $scope.FormReleases[i].StartDate = new moment.unix($scope.FormReleases[i].StartDate).toDate();
        
                        $scope.FormReleases[i].Description = $filter('filter')($scope.Constants.InvoiceTypes, {Code:$scope.FormReleases[i].FormTypeInvoiceType})[0].Name + " - " + $scope.FormReleases[i].FormTypeNumberForm + " - " + $scope.FormReleases[i].FormTypeSymbol;
                        $scope.FormReleases[i].Description += " (From : " + $scope.FormReleases[i].ReleaseFrom + " - To : " + $scope.FormReleases[i].ReleaseTo + ")";
                    }

                    if (!angular.isUndefinedOrNull($scope.EditInvoice.ID))
                        $scope.getInvoice($scope.EditInvoice.ID);
                    else if ($scope.EditInvoice.InvoiceLines && $scope.EditInvoice.InvoiceLines.length > 0) { //trong truong hop dieu chinh thay the hoa don
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
                    }
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

            _invoiceLine.Status = $scope.Constants.InvoiceStatus[0].Code;
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
            var _numberToWords = NumberToWords(totalPayment);
            $scope.EditInvoice.TotalPaymentWords = _numberToWords.charAt(0).toUpperCase() + _numberToWords.slice(1) + " đồng chẵn";
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