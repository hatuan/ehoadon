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
            {Code : 0, Name : '0% Vat' },
            {Code : 5, Name : '5% Vat' },
            {Code : 10, Name : '10% Vat' },
        ]
    })
});