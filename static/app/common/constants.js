/**
 * Created by tuanha-01 on 5/11/2016.
 */
"use strict";

define(['angular'], function (angular) {
    var constantModule = angular.module('myApp.Constants', [])
    constantModule.constant('Constants', {
        Status: [
            {Code : 0, Name : 'Deactive'},
            {Code : 1, Name : 'Active'},
        ],
        BooleanTypes: [
            {Code : 0, Name : ''},
            {Code : 1, Name : 'Yes'},
        ],
        VatTypes: [
            {Code : -1, Name : 'No Vat'},
            {Code : 0, Name : '0%' },
            {Code : 5, Name : '5%' },
            {Code : 10, Name : '10%' },
        ],
        InvoiceFormTypes: [
            {Code : '', Name : 'All'},
            {Code : 'E', Name : 'HĐ Điện tử (TT32)'},
        ],
        //01GTKT : Hoa don GTGT, 02GTTT : Hoa don ban hang, 03XNKNB : Xuat kho noi bo , 04HGDL : Hang gui dai ly , 07KPTQ : Khu phi thue quan
        InvoiceTypes: [
            {Code : '', Name : 'All'},
            {Code : '01GTKT', Name : 'Hóa đơn GTGT'},
            {Code : '02GTTT', Name : 'Hóa đơn bán hàng'},
        ],
    })
});