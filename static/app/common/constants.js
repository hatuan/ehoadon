/**
 * Created by tuanha-01 on 5/11/2016.
 */
"use strict";

define(['angular'], function (angular) {
    var constantModule = angular.module('myApp.Constants', [])
    constantModule.constant('Constants', {
        Status: [
            {Code : 0, Name : 'Blocked'},
            {Code : 1, Name : 'Actived'},
        ],
        BooleanTypes: [
            {Code : 0, Name : ''},
            {Code : 1, Name : 'Yes'},
        ],
        CompanyGroupUnits: [
            {Code: 'DN', Name: 'Business'},
            {Code: 'HS', Name: 'School'},
            {Code: 'YT', Name: 'Medical'},
            {Code: 'OT', Name: 'Other'},
        ],
        VatMethods: [
            {Code: 'TRUC_TIEP', Name: 'Direct method'},
            {Code: 'KHAU_TRU', Name: 'Deduction method'},
            {Code: 'CHE_XUAT', Name: 'Export proccessing zone'},
        ],
        VatTypes: [
            {Code : -1, Name : 'No Vat'},
            {Code : 0, Name : '0%' },
            {Code : 5, Name : '5%' },
            {Code : 10, Name : '10%' },
        ],
        InvoiceStatus: [
            {Code : 0, Name : 'Draft'},
            {Code : 1, Name : 'Signed'},
            {Code : 2, Name : 'Sended'},
        ],
        InvoiceForms: [
            {Code : 'E', Name : 'HĐ Điện tử (TT32)'},
        ],
        //01GTKT : Hoa don GTGT, 02GTTT : Hoa don ban hang, 03XNKNB : Xuat kho noi bo , 04HGDL : Hang gui dai ly , 07KPTQ : Khu phi thue quan
        InvoiceTypes: [
            {Code : '01GTKT', Name : 'Hóa đơn GTGT'},
            {Code : '02GTTT', Name : 'Hóa đơn bán hàng'},
        ],
        TaxAuthoritiesStatus: [
            {Code : 0, Name : 'Chờ phát hành'},
            {Code : 1, Name : 'Đã phát hành'},
        ],
        Priorities:[
            {Code : 0, Name: 'Very Low'},
            {Code : 1, Name: 'Low'},
            {Code : 2, Name: 'Normal'},
            {Code : 3, Name: 'Hight'},
            {Code : 4, Name: 'Very Hight'},
        ],
        DocumentStates: {
            New: "New",
            View: "View",
            Edit: "Edit",
        }
    })

    constantModule.constant('DocumentStates', {
        New: "New",
        View: "View",
        Edit: "Edit",
    });
});