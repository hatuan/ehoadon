/**
 * Created by tuanha-01 on 5/13/2016.
 */
"use strict";

define(['angularAMD', 'jquery', 'ajaxService', 'alertsService', 'clientService', 'eInvoiceService', 'eInvoiceFormTypeService'], function(angularAMD, $) {
    var injectParams = ['$scope', '$rootScope', '$state', '$sce', '$auth', '$window', 'moment', '$uibModal', '$uibModalInstance', 'ajaxService', 'alertsService', 'clientService', 'eInvoiceService', 'eInvoiceFormTypeService', '$stateParams', '$confirm', 'Constants', 'editInvoice'];

    var invoiceViewReportController = function($scope, $rootScope, $state, $sce, $auth, $window, moment, $uibModal, $uibModalInstance, ajaxService, alertsService, clientService, eInvoiceService, eInvoiceFormTypeService, $stateParams, $confirm, Constants, editInvoice) {
       
        $scope.initializeController = function() {
            $scope.Constants = Constants;
            $scope.EditInvoice = editInvoice;
            $scope.FormType = {};
            $scope.FormVars = {};
            $scope.Client = {};
            $scope.Token = {};

            $scope.report = null;

            if(!angular.isUndefinedOrNull($scope.EditInvoice.FormTypeID))
                clientService.getClient(
                    function(response, status) { //success
                        $scope.Client = response.Data.Client;
            
                        $scope.Token = response.Data.eInvoiceClient;
                        $scope.Token.TokenCertValidFrom = new moment.unix(response.Data.eInvoiceClient.TokenCertValidFrom).toDate();
                        $scope.Token.TokenCertValidTo = new moment.unix(response.Data.eInvoiceClient.TokenCertValidTo).toDate();

                        $scope.getFormType($scope.EditInvoice.FormTypeID);
                    }, 
                    function(response) { //error
                        alertsService.RenderErrorMessage(response.Error);
                    }
                );
            else
                alert("Report has error : Unknow FormTypeID");
        }
/*
        $scope.signDocument = function() {
            if(!angular.isUndefinedOrNull($scope.report)) {
                var settings = new Stimulsoft.Report.Export.StiPdfExportSettings();
                // Create an PDF service instance.
                var service = new Stimulsoft.Report.Export.StiPdfExportService();
            
                // Create a MemoryStream object.
                var stream = new Stimulsoft.System.IO.MemoryStream();
                // Export PDF using MemoryStream.
                service.exportTo($scope.report, stream, settings);
            
                // Get PDF data from MemoryStream object
                var data = stream.toArray(); //or var data = $scope.report.exportDocument(Stimulsoft.Report.StiExportFormat.Pdf);
                var dataBase64 = arrayBufferToBase64(data);
                var myAx;
                try {
                    myAx = new ActiveXObject("EInvoiceSignPlugin.EInvoiceSignActiveX");
                } catch (ex) {
                    alert("Chức năng đọc chữ ký số chỉ hoạt động trên IE với Sercurity level : low và đã cài đặt plugin");
                    return;
                }

                try
                {
                    var signedInfo = myAx.SignDocument(dataBase64, 
                        $scope.Token.TokenSerialNumber, 
                        $scope.EditInvoice.ID, 
                        $scope.EditInvoice.Version + '', 
                        $scope.Constants.InvoiceStatus[1].Code + '', 
                        $auth.getToken());
                } catch(err) {
                    settings = null;
                    stream = null;
                    service = null;
                    data = null;
                    dataBase64 = null;
                    
                    alert(err.message);
                    return;
                }     
                settings = null;
                stream = null;
                service = null;
                data = null;
                dataBase64 = null;

                var postData = {
                    'InvoiceID' : signedInfo.DocumentID,
                    'PDFBase64' : signedInfo.SignedContent,
                    'PDFBase64MD5' : signedInfo.SignedContentMD5,
                    'Status' : signedInfo.SignedStatus,
                    'Version' : signedInfo.DocumentVersion
                };
                $.ajax({
                    url: '/api/einvoiceFiles',
                    method: "POST",
                    async: false,
                    contentType: "application/json;charset=utf-8",
                    dataType: "json", 
                    data: JSON.stringify(postData),
                    beforeSend: function (xhr) {   //Include the bearer token in header
                        xhr.setRequestHeader("Authorization", signedInfo.JwtToken);
                    }
                })
                .done(function(response) {
                    alert( "POST einvoiceFile" );
                })
                .fail(function(response) {
                    alert( "POST einvoiceFile error" );
                });
            }
        };
*/
        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };
        
        $scope.$on('modal.closing', function(event, reason, closed){
            $uibModalInstance.result.EditInvoice = $scope.EditInvoice;
        });

        $scope.getFormType = function(_ID) {
            var formTypeInquiry = new Object();
            formTypeInquiry.ID = _ID

            eInvoiceFormTypeService.getFormType(
                formTypeInquiry, 
                function(response, status) { //success
                    $scope.FormType = response.Data.eInvoiceFormType;
                    
                    try {
                        $scope.FormVars = JSON.parse($scope.FormType.FormVars);
                    } catch(e) {
                        $scope.FormVars = {};
                        delete $scope.EditFormType.FormVars;

                        alert("Has error in report process  : FormVars not found"); 
                    }

                    $scope.getInvoice($scope.EditInvoice.ID);
                },
                function(response) { //error
                    alertsService.RenderErrorMessage(response.Error);
                }
            )
        }

        $scope.getInvoice = function(_ID) {
            var invoiceInquiry = new Object();
            invoiceInquiry.ID = _ID
            eInvoiceService.getInvoice(
                invoiceInquiry, 
                function(response, status) { //success
                    $scope.EditInvoice = response.Data.eInvoice;
                    $scope.getReport($scope.FormType.FormFileName, $scope.FormType.FormFile);        
                },
                function(response) { //error
                    alertsService.RenderErrorMessage(response.Error);
                }
            )
        };

        $scope.getReport = function(formFileName, formFile){
            if(!angular.isUndefinedOrNull(formFile)) {
                $scope.renderReport();     
            } else if(!angular.isUndefinedOrNull(formFileName)) {
                ajaxService.AjaxGet("/reports/" + formFileName + ".mrt", $scope.getReportDesignSuccessFunction, $scope.getReportDesignErrorFunction);
            }
        }

        $scope.getReportDesignSuccessFunction = function(response, status) {
            $scope.FormType.FormFile = response;
            $scope.renderReport(); 
        };

        $scope.getReportDesignErrorFunction = function(response, status) {
            alertsService.RenderErrorMessage(response.Error);   
        };

        $scope.renderReport = function() {
            var dataSet = new Stimulsoft.System.Data.DataSet("Invoice");
            var ds = {};
            ds.Invoice = $scope.EditInvoice;
            ds.InvoiceLines = $scope.EditInvoice.InvoiceLines;
            ds.Vars = $scope.FormVars;

            for(var _i = ds.InvoiceLines.length; _i < 10; _i++ ) {
                ds.InvoiceLines.push({LineNo: _i + 1});
            }
            dataSet.readJson(ds);

            var viewer = new $window.Stimulsoft.Viewer.StiViewer(null, 'StiViewer', false);

            viewer.options.toolbar.visible = false;
            viewer.options.toolbar.viewMode = Stimulsoft.Viewer.StiWebViewMode.WholeReport;
            viewer.options.appearance.scrollbarsMode = true;
            viewer.options.width = "100%";
            viewer.options.height = $("#modal-body").height() + "px";
            viewer.renderHtml('reportviewer');

            setTimeout(function () {
				var report = new $window.Stimulsoft.Report.StiReport();
                report.load($scope.FormType.FormFile);
                // Remove all connections in report template (they are used in the first place)
                report.dictionary.databases.clear();
                // Registered JSON data specified in the report with same name
                report.regData(dataSet.dataSetName, "", dataSet);
				// Assign the report to the viewer
                viewer.report = report;
                
                $scope.report = report;
			}, 50);

        };
    };

    invoiceViewReportController.$inject = injectParams;
    angularAMD.controller('eInvoiceViewReportController', invoiceViewReportController);
});