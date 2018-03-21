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
        },
        NumberPadding: "0000000",
        ProcessInvoiceStatus: { /* 0 : Hoa don goc, 1 : Hoa don bi dieu chinh, 2 : Hoa don dieu chinh, 3: Hoa don bi thay the, 4: Hoa don thay the */
            "HD_GOC" : 0,
            "HD_BI_DIEU_CHINH": 1,
            "HD_DIEU_CHINH": 2,
            "HD_BI_THAY_THE": 3,
            "HD_THAY_THE": 4,
        },
        ProcessInvoiceStatusDescription: {
            0: "Hóa đơn gốc",
            1: "Hóa đơn bị điều chỉnh",
            2: "Hóa đơn điều chỉnh",
            3: "Hóa đơn bị thay thế",
            4: "Hóa đơn thay thế",
        },
        DocumentAdjTypes: {
            1: "Điều chỉnh tăng",
            2: "Điều chỉnh giảm",
            3: "Điều chỉnh thông tin"
        }
    })
});