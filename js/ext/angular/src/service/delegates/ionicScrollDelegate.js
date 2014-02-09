(function() {
'use strict';

angular.module('ionic.ui.service.scrollDelegate', [])

.factory('$ionicScrollDelegate', ['$rootScope', '$timeout', '$q', '$anchorScroll', '$location', '$document', function($rootScope, $timeout, $q, $anchorScroll, $location, $document) {
  return {
    /**
     * Trigger a scroll-to-top event on child scrollers.
     */
    scrollTop: function(animate) {
      $rootScope.$broadcast('scroll.scrollTop', animate);
    },
    scrollBottom: function(animate) {
      $rootScope.$broadcast('scroll.scrollBottom', animate);
    },
    resize: function() {
      $rootScope.$broadcast('scroll.resize');
    },
    anchorScroll: function() {
      $rootScope.$broadcast('scroll.anchorScroll');
    },
    tapScrollToTop: function(element) {
      var _this = this;

      ionic.on('tap', function(e) {
        var el = element[0];
        var bounds = el.getBoundingClientRect();

        if(ionic.DomUtil.rectContains(e.gesture.touches[0].pageX, e.gesture.touches[0].pageY, bounds.left, bounds.top, bounds.left + bounds.width, bounds.top + 20)) {
          _this.scrollTop();
        }
      }, element[0]);
    },

    finishRefreshing: function($scope) {
      $scope.$broadcast('scroll.refreshComplete');
    },

    /**
     * Attempt to get the current scroll view in scope (if any)
     *
     * Note: will not work in an isolated scope context.
     */
    getScrollView: function($scope) {
      return $scope.scrollView;
    },
    /**
     * Register a scope for scroll event handling.
     * $scope {Scope} the scope to register and listen for events
     */
    register: function($scope, $element) {
      //Get scroll controller from parent
      var scrollCtrl = $element.controller('$ionicScroll');
      if (!scrollCtrl) {
        return;
      }
      var scrollView = scrollCtrl.scrollView;
      var scrollEl = scrollCtrl.element;

      function scrollViewResize() {
        // Run the resize after this digest
        return $timeout(function() {
          scrollView.resize();
        });
      }

      $element.bind('scroll', function(e) {
        $scope.onScroll && $scope.onScroll({
          event: e,
          scrollTop: e.detail ? e.detail.scrollTop : e.originalEvent ? e.originalEvent.detail.scrollTop : 0,
          scrollLeft: e.detail ? e.detail.scrollLeft: e.originalEvent ? e.originalEvent.detail.scrollLeft : 0
        });
      });

      $scope.$parent.$on('scroll.resize', scrollViewResize);

      // Called to stop refreshing on the scroll view
      $scope.$parent.$on('scroll.refreshComplete', function(e) {
        scrollView.finishPullToRefresh();
      });

      $scope.$parent.$on('scroll.anchorScroll', function() {
        var hash = $location.hash();
        var elm;
        //If there are multiple with this id, go to first one
        if (hash && (elm = scrollEl.querySelectorAll('#' + hash)[0])) {
          var scroll = ionic.DomUtil.getPositionInParent(elm, scrollEl);
          scrollView.scrollTo(scroll.left, scroll.top);
        } else {
          scrollView.scrollTo(0,0);
        }
      });

      /**
       * Called to scroll to the top of the content
       *
       * @param animate {boolean} whether to animate or just snap
       */
      $scope.$parent.$on('scroll.scrollTop', function(e, animate) {
        scrollViewResize().then(function() {
          scrollView.scrollTo(0, 0, animate === false ? false : true);
        });
      });
      $scope.$parent.$on('scroll.scrollBottom', function(e, animate) {
        scrollViewResize().then(function() {
          var sv = scrollView;
          if (sv) {
            var max = sv.getScrollMax();
            sv.scrollTo(0, max.top, animate === false ? false : true);
          }
        });
      });
    }
  };
}]);

})(ionic);
