/**
 * Created by tuanha-01 on 5/23/2016.
 */
define(['angularAMD', 'ajaxService'], function (angularAMD) {

    var injectParams = ['ajaxService'];

    var searchDirective = function (ajaxService) {
        return {
            restrict: 'EA',
            templateUrl: 'app/common/directives/searchForm.html',
            scope: {
                searchConditionObjects: '=searchConditionObjects',
                parentSearch: '&searchCallback' //parameter must lowcase???? (Ex : searchSqlCondition don't work')
            },
            controller: function($scope){
                $scope.initializeController = function () {
                    $scope.searchSqlCondition = "";

                    $scope.searchConditions = [];
                    $scope.addSearchCondition();
                }

                $scope.startSearch = function() {
                    var searchConditions = [];
                    
                    for(var _i = 0; _i < $scope.searchConditions.length; _i ++) {
                        searchConditions.push({
                            "ID": $scope.searchConditions[_i].Object.ID,
                            "Value": $scope.searchConditions[_i].Object.Value,
                        });
                    }

                    ajaxService.AjaxPost(searchConditions, "/api/sqlparse", $scope.searchCompleted, $scope.searchError);
                }

                $scope.clearSearch = function() {
                    $scope.searchConditions = [];
                    $scope.addSearchCondition();

                    $scope.searchSqlCondition = "";
                    $scope.parentSearch({param: ""});
                }

                $scope.searchCompleted = function(response, status) {
                    var errs = response.Data.Errs;
                    var stmts = response.Data.Stmts;
                    
                    for(var _i = 0; _i < errs.length; _i ++) {
                        $scope.searchConditions[_i].Error = "";
                        $scope.searchConditions[_i].HasError = false;
                        $scope.searchConditions[_i].Stmt = stmts[_i];
                        if (_i == 0)
                            $scope.searchSqlCondition = "(" + $scope.searchConditions[_i].Stmt +")";
                        else 
                            $scope.searchSqlCondition += " AND (" + $scope.searchConditions[_i].Stmt + ")";
                    }
                    $scope.searchSqlCondition = "(" + $scope.searchSqlCondition + ")";

                    $scope.parentSearch({param: $scope.searchSqlCondition});
                }

                $scope.searchError = function(response, status) {
                    var errs = response.Data.Errs;
                    var stmts = response.Data.Stmts;
                    for(var _i = 0; _i < errs.length; _i ++) {
                        $scope.searchConditions[_i].Error = errs[_i];
                        $scope.searchConditions[_i].HasError = errs[_i].length > 0;
                        $scope.searchConditions[_i].Stmt = stmts[_i];
                    }
                }

                 $scope.addSearchCondition = function(){
                    var searchCondition = new Object();
                    searchCondition.No = $scope.searchConditions.length + 1;
                    searchCondition.Err = "";
                    searchCondition.HasError = false;
                    searchCondition.Stmt = "";
                    searchCondition.Objects = JSON.parse(JSON.stringify($scope.searchConditionObjects));
                    searchCondition.Object = searchCondition.Objects[0];

                    $scope.searchConditions.push(searchCondition);
                }
                
                $scope.removeSearchCondition = function(_index){
                    $scope.searchConditions.splice(_index, 1);
                }

                $scope.initializeController();
            },
        }
    };

    searchDirective.$inject = injectParams;

    angularAMD.directive('searchForm', searchDirective)
});
