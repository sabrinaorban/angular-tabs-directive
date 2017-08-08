angular.module('App', ['ui.router'])

.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider)

	{
        $urlRouterProvider.otherwise('/');
        

	}])
.controller( 'AppCtrl', ['$rootScope', '$scope', '$location', function ( $rootScope, $scope, $location) {
  $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
      window.scrollTo(0, 0);

  });
  $scope.navOpen = false;
  $scope.toggleNav = function(){
    $scope.navOpen = !$scope.navOpen;
      
  };



}])
.directive('tabsWrapper', function() {
        'use strict';

        return {
            restrict  : 'A',
            controller: function($scope) {
                $scope.tabs = {};
                this.scope  = $scope;     
            }
        };
    })
.directive('tabSet', function($stateParams, $timeout) {
    'use strict';
    return {
        restrict  : 'A',
        scope     : {
            tabChangeHandler: '='
        },
        require   : '^tabsWrapper',
        controller: function($scope) {
            $scope.selectedTab = null;
            $scope.defaultTab  = null;
            $scope.tabs        = {};

            this.scope = $scope;
        },
        link      : function(scope, element, attrs, tabsWrapper) {
            var timeout = $timeout(function() {
                var keys        = Object.keys(tabsWrapper.scope.tabs);
                var tabToSelect = $stateParams.tab || scope.defaultTab || (keys.length && keys[0]);
                if (tabToSelect) {
                    scope.select(tabToSelect);
                }
            });

            scope.addItem = function(key, isDefault) {
                tabsWrapper.scope.tabs[key] = {active: false};
                if (isDefault) {
                    scope.defaultTab = key;
                }
            };

            scope.select = function(key) {
                if (scope.selectedTab === key) {
                    return;
                }

                if (scope.selectedTab) {
                    tabsWrapper.scope.tabs[scope.selectedTab].active = false;
                }

                tabsWrapper.scope.tabs[key].active = true;
                scope.selectedTab = key;

                if (!scope.$$phase) {
                    scope.$apply();
                }
            };

            scope.$on('$destroy', function() {
                if (timeout) {
                    $timeout.cancel(timeout);
                }
            });
        }

      };
  })
  .directive('tab', function($state, $timeout) {
      'use strict';

      return {
          restrict: 'A',
          require : '^tabSet',
          scope   : {
              tabName   : '@tab',
              defaultTab: '@'
          },
          link    : function(scope, element, attrs, tabSetCtrl) {
              var timeout = $timeout(function() {
                  tabSetCtrl.scope.addItem(scope.tabName, scope.defaultTab !== undefined);
              });

              element.on('click', function() {
                  var state  = $state.current.name,
                      params = {};

                  params.tab = scope.tabName;
                  // $state.go(state, params, { reload: false });
                  $state.transitionTo(state, params, {
                      notify: false,
                      reload: false,
                      location: 'replace'
                  });

                  if (tabSetCtrl.scope.tabChangeHandler) {
                      tabSetCtrl.scope.tabChangeHandler(scope.tabName);
                  }
                  tabSetCtrl.scope.select(scope.tabName);
              });

              scope.$on('$destroy', function() {
                  if (timeout) {
                      $timeout.cancel(timeout);
                  }
              });
          }
      };
  })

;