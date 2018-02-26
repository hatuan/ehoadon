/**
 * Created by tuanha-01 on 5/30/2016.
 */
define(['angularAMD', 'jquery', 'reportjs-report', 'reportjs-viewer', 'ajaxService', 'clientService', 'eInvoiceService', 'eInvoiceFormTypeService'], function (angularAMD, $) {

    var injectParams = ['$auth', '$window', 'moment', '$confirm', 'ajaxService', 'Constants', 'clientService', 'eInvoiceService', 'eInvoiceFormTypeService'];

    var einvoiceSignFunction = function($auth, $window, moment, $confirm, ajaxService, Constants, clientService, eInvoiceService, eInvoiceFormTypeService) { 
        var SignInvoice = {},
            Client = {},
            Token = {},
            FormType = {},
            FormVars = {};

        this.SignDocument = function(document, successFunction, errorFunction) {
            SignInvoice = $.extend(true, {}, document);
            if(!angular.isUndefinedOrNull(document.FormTypeID))
                clientService.getClient(
                    function(response, status) { //success
                        Client = response.Data.Client;
            
                        Token = response.Data.eInvoiceClient;
                        Token.TokenCertValidFrom = new moment.unix(response.Data.eInvoiceClient.TokenCertValidFrom).toDate();
                        Token.TokenCertValidTo = new moment.unix(response.Data.eInvoiceClient.TokenCertValidTo).toDate();

                        getFormType(SignInvoice.FormTypeID);
                    }, 
                    function(response) { //error
                        errorFunction(response);
                    }
                );
            else
                alert("Report has error : Unknow FormTypeID");

           
            getFormType = function(_ID) {
                var formTypeInquiry = new Object();
                formTypeInquiry.ID = _ID
    
                eInvoiceFormTypeService.getFormType(
                    formTypeInquiry, 
                    function(response, status) { //success
                        FormType = response.Data.eInvoiceFormType;
                        
                        try {
                            FormVars = JSON.parse(FormType.FormVars);
                        } catch(e) {
                            FormVars = {};
                        }
                        if(SignInvoice.InvoiceNo === "") 
                            getInvoice(SignInvoice.ID);
                        else
                            getReport(FormType.FormFileName, FormType.FormFile);
                    },
                    function(response) { //error
                        errorFunction(response);
                    }
                )
            };
    
            getInvoice = function(_ID) {
                var invoiceInquiry = new Object();
                invoiceInquiry.ID = _ID
                eInvoiceService.getInvoiceForSign(
                    invoiceInquiry, 
                    function(response, status) { //success
    
                        SignInvoice = $.extend(true, {},response.Data.eInvoice);
                        SignInvoice.InvoiceDate = new moment.unix(SignInvoice.InvoiceDate).toDate();
                        SignInvoice.RecCreated = new moment.unix(SignInvoice.RecCreated).toDate();
                        SignInvoice.RecModified = new moment.unix(SignInvoice.RecModified).toDate();
    
                        getReport(FormType.FormFileName, FormType.FormFile);
                    },
                    function(response) { //error
                        errorFunction(response);
                    }
                )
            };
    
            getReport = function(formFileName, formFile){
                if(!angular.isUndefinedOrNull(formFile)) {
                    renderReport();     
                } else if(!angular.isUndefinedOrNull(formFileName)) {
                    ajaxService.AjaxGet("/reports/" + formFileName + ".mrt", getReportDesignSuccessFunction, getReportDesignErrorFunction);
                }
            }
    
            getReportDesignSuccessFunction = function(response, status) {
                FormType.FormFile = response;
                renderReport(); 
            };
    
            getReportDesignErrorFunction = function(response, status) {
                errorFunction(response);
            };
    
            renderReport = function() {
                var dataSet = new Stimulsoft.System.Data.DataSet("Invoice");
                var ds = {};
                ds.Invoice = $.extend(true, {},SignInvoice);
                ds.InvoiceLines = ds.Invoice.InvoiceLines;
                ds.Vars = FormVars;
    
                for(var _i = ds.InvoiceLines.length; _i < 10; _i++ ) {
                    ds.InvoiceLines.push({LineNo: _i + 1});
                }
                dataSet.readJson(ds);
   
                //setTimeout(function () {
                    var myAx;
                    try {
                        myAx = new ActiveXObject("EInvoiceSignPlugin.EInvoiceSignActiveX");
                    } catch (ex) {
                        alert("Chức năng đọc chữ ký số chỉ hoạt động trên IE với Sercurity level : low và đã cài đặt plugin");
                        return;
                    }

                    var report = new $window.Stimulsoft.Report.StiReport();
                    report.load(FormType.FormFile);
                    // Remove all connections in report template (they are used in the first place)
                    report.dictionary.databases.clear();
                    // Registered JSON data specified in the report with same name
                    report.regData(dataSet.dataSetName, "", dataSet);
                    report.render();
                    var settings = new Stimulsoft.Report.Export.StiPdfExportSettings();
                    // Create an PDF service instance.
                    var service = new Stimulsoft.Report.Export.StiPdfExportService();
                    // Create a MemoryStream object.
                    var stream = new Stimulsoft.System.IO.MemoryStream();
                    // Export PDF using MemoryStream.
                    service.exportTo(report, stream, settings);
                    // Get PDF data from MemoryStream object
                    var data = stream.toArray(); //or var data = $scope.report.exportDocument(Stimulsoft.Report.StiExportFormat.Pdf);
                    var dataBase64 = arrayBufferToBase64(data);
    
                    try
                    {
                        var signedInfo = myAx.SignDocument(dataBase64, 
                            Token.TokenSerialNumber, 
                            SignInvoice.ID, 
                            SignInvoice.Version + '', 
                            Constants.InvoiceStatus[1].Code + '', 
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
                        successFunction(response)
                    })
                    .fail(function(response) {
                        errorFunction(response)
                    });
                //}, 50);
            };    
        };
    }

    einvoiceSignFunction.$inject = injectParams;
    angularAMD.service('eInvoiceSignService', einvoiceSignFunction);
});
