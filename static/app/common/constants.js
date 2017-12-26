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
        ContactTypes:[
            {Code : 0, Name: ''},
            {Code : 1, Name: 'Companies'},
            {Code : 2, Name: 'People'},
        ],
        ProfileQuestionaireLineTypes: [
            {Code : 0, Name: 'Question'},
            {Code : 1, Name: 'Answer'},
        ],
        ProfileQuestionaireLineCustomerClassFieldTypes: [
            {Code : 0, Name: ''},
            {Code : 1, Name: 'Sales (LCY)'},
            {Code : 2, Name: 'Profit (LCY)'},
            {Code : 3, Name: 'Sales Frequency (Invoices/Year)'},
            {Code : 4, Name: 'Avg. Invoice Amount (LCY)'},
            {Code : 5, Name: 'Discount (%)'},
            {Code : 5, Name: 'Avg. Overdue (Day)'},
        ],
        ProfileQuestionaireLineVendorClassFieldTypes: [
            {Code : 0, Name: ''},
            {Code : 1, Name: 'Purchase (LCY)'},
            {Code : 2, Name: 'Purchase Frequency (Invoices/Year)'},
            {Code : 3, Name: 'Avg. Ticket Size (LCY)'},
            {Code : 4, Name: 'Discount (%)'},
            {Code : 5, Name: 'Avg. Overdue (Day)'},
        ],
        ProfileQuestionaireLineContactClassFieldTypes: [
            {Code : 0, Name: ''},
            {Code : 1, Name: 'Interaction Quantity'},
            {Code : 2, Name: 'Interaction Frequency (No./Year)'},
            {Code : 3, Name: 'Avg. Interaction Duration (Min.)'},
            {Code : 4, Name: 'Opportunity Won (%)'},
            {Code : 5, Name: 'Rating'},
        ],
        ProfileQuestionaireLineClassificationMethodTypes: [
            {Code : 0, Name: ''},
            {Code : 1, Name: 'Defined Value'},
            {Code : 2, Name: 'Percentage of Value'},
            {Code : 3, Name: 'Percentage of Contacts'},
        ],
        ProfileQuestionaireLineSortingMethodTypes: [
            {Code : 0, Name: ''},
            {Code : 1, Name: 'Descending'},
            {Code : 2, Name: 'Ascending'},
        ],
    })
});