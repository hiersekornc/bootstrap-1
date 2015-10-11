angular.module('ui.bootstrap.timepicker', [])

  .constant('uibTimepickerConfig', {
    dayStep: 1,
    hourStep: 1,
    minuteStep: 1,
    secondStep: 1,
    readonlyInput: false,
    mousewheel: true,
    showsDays: false
  })

  .controller('UibTimepickerController', ['$scope', '$attrs', '$parse', '$log', '$locale', 'uibTimepickerConfig', function($scope, $attrs, $parse, $log, $locale, timepickerConfig) {
    var helper  = {
      getDays: function(date) {
        return Math.floor( date.valueOf() / this.MS_IN_A_DAY )
      },
      getHours: function(date) {
        return date.getUTCHours()
      },
      getMinutes: function(date) {
        return date.getUTCMinutes()
      },
      getSeconds: function(date) {
        return date.getUTCSeconds()
      },
      setDays: function(date, days) {
        var daylessDate = date.getTime() % this.MS_IN_A_DAY;
        date.setTime( daylessDate + days * this.MS_IN_A_DAY);
      },
      setHours: function(date, hours) {
        date.setUTCHours(hours);
      },
      setMinutes: function(date, minutes) {
        date.setUTCMinutes(minutes);
      },
      setSeconds: function(date, seconds) {
        date.setUTCSeconds(seconds);
      },
      addDays: function(date, days) {
        date.setTime( date.getTime() + days * this.MS_IN_A_DAY );
      },
      addHours: function(date, hours) {
        date.setTime( date.getTime() + hours * this.MS_IN_AN_HOUR );
      },
      addMinutes: function(date, minutes) {
        date.setTime( date.getTime() + minutes * this.MS_IN_A_MINUTE );
      },
      addSeconds: function(date, seconds) {
        date.setTime( date.getTime() + seconds * this.MS_IN_A_SECOND );
      },
      MS_IN_A_DAY: 86400000,
      MS_IN_AN_HOUR: 3600000,
      MS_IN_A_MINUTE: 60000,
      MS_IN_A_SECOND: 1000
    };
    var selected = new Date(0),
      ngModelCtrl = { $setViewValue: angular.noop };

    this.init = function(ngModelCtrl_, inputs) {
      ngModelCtrl = ngModelCtrl_;
      ngModelCtrl.$render = this.render;

      ngModelCtrl.$formatters.unshift(function(modelValue) {
        return modelValue ? new Date(modelValue) : null;
      });

      var daysInputEl = inputs.eq(0),
        hoursInputEl = inputs.eq(1),
        minutesInputEl = inputs.eq(2),
        secondsInputEl = inputs.eq(3);

      var mousewheel = angular.isDefined($attrs.mousewheel) ? $scope.$parent.$eval($attrs.mousewheel) : timepickerConfig.mousewheel;
      if (mousewheel) {
        this.setupMousewheelEvents( daysInputEl, hoursInputEl, minutesInputEl, secondsInputEl );
      }

      $scope.readonlyInput = angular.isDefined($attrs.readonlyInput) ? $scope.$parent.$eval($attrs.readonlyInput) : timepickerConfig.readonlyInput;
      $scope.showsDays = angular.isDefined($attrs.showsDays) ? $scope.$parent.$eval($attrs.showsDays) : timepickerConfig.showsDays;
      this.setupInputEvents( daysInputEl, hoursInputEl, minutesInputEl, secondsInputEl );
    };

    var dayStep = timepickerConfig.dayStep;
    var hourStep = timepickerConfig.hourStep;
    var minuteStep = timepickerConfig.minuteStep;
    var secondStep = timepickerConfig.secondStep;

    function getDaysFromTemplate() {
      var days = parseInt($scope.days, 10);
      return ( days >= 0 ) ? days : undefined;
    }

    function getHoursFromTemplate() {
      var hours = parseInt($scope.hours, 10);
      return (hours >= 0 && hours < 24) ? hours : undefined;
    }

    function getMinutesFromTemplate() {
      var minutes = parseInt($scope.minutes, 10);
      return (minutes >= 0 && minutes < 60) ? minutes : undefined;
    }

    function getSecondsFromTemplate() {
      var seconds = parseInt($scope.seconds, 10);
      return (seconds >= 0 && seconds < 60) ? seconds : undefined;
    }

    function pad(value) {
      return (angular.isDefined(value) && value.toString().length < 2) ? '0' + value : value.toString();
    }

    // Respond on mousewheel spin
    this.setupMousewheelEvents = function(daysInputEl, hoursInputEl, minutesInputEl, secondsInputEl) {
      var isScrollingUp = function(e) {
        if (e.originalEvent) {
          e = e.originalEvent;
        }
        //pick correct delta variable depending on event
        var delta = (e.wheelDelta) ? e.wheelDelta : -e.deltaY;
        return (e.detail || delta > 0);
      };

      daysInputEl.bind('mousewheel wheel', function(e) {
        $scope.$apply(isScrollingUp(e) ? $scope.incrementDays() : $scope.decrementDays());
        e.preventDefault();
      });

      hoursInputEl.bind('mousewheel wheel', function(e) {
        $scope.$apply(isScrollingUp(e) ? $scope.incrementHours() : $scope.decrementHours());
        e.preventDefault();
      });

      minutesInputEl.bind('mousewheel wheel', function(e) {
        $scope.$apply(isScrollingUp(e) ? $scope.incrementMinutes() : $scope.decrementMinutes());
        e.preventDefault();
      });

      secondsInputEl.bind('mousewheel wheel', function(e) {
        $scope.$apply(isScrollingUp(e) ? $scope.incrementSeconds() : $scope.decrementSeconds());
        e.preventDefault();
      });

    };

    this.setupInputEvents = function(daysInputEl, hoursInputEl, minutesInputEl, secondsInputEl) {
      if ($scope.readonlyInput) {
        $scope.updateDays = angular.noop;
        $scope.updateHours = angular.noop;
        $scope.updateMinutes = angular.noop;
        $scope.updateSeconds = angular.noop;
        return;
      }

      var invalidate = function() {
        ngModelCtrl.$setViewValue(null);
        ngModelCtrl.$setValidity('time', false);
      };

      var isAllDefined = function() {
        var days = getDaysFromTemplate(),
          hours = getHoursFromTemplate(),
          minutes = getMinutesFromTemplate(),
          seconds = getSecondsFromTemplate();
        return angular.isDefined(days) && angular.isDefined(hours) && angular.isDefined(minutes) && angular.isDefined(seconds);
      };

      $scope.updateDays = function() {
        if (isAllDefined()) {
          var days = getDaysFromTemplate();
          helper.setDays(selected, days);
          refresh( 'd' );
        } else {
          invalidate();
        }
      };

      $scope.updateHours = function() {
        if (isAllDefined()) {
          var hours = getHoursFromTemplate();
          helper.setHours(selected, hours);
          refresh('h');
        } else {
          invalidate();
          $scope.invalidHours = true;
        }
      };

      hoursInputEl.bind('blur', function(e) {
        if (!$scope.invalidHours && $scope.hours < 10) {
          $scope.$apply(function() {
            $scope.hours = pad($scope.hours);
          });
        }
      });

      $scope.updateMinutes = function() {
        if (isAllDefined()) {
          var minutes = getMinutesFromTemplate();
          helper.setMinutes(selected, minutes);
          refresh('m');
        } else {
          invalidate();
          $scope.invalidMinutes = true;
        }
      };

      minutesInputEl.bind('blur', function(e) {
        if (!$scope.invalidMinutes && $scope.minutes < 10) {
          $scope.$apply(function() {
            $scope.minutes = pad($scope.minutes);
          });
        }
      });

      $scope.updateSeconds = function() {
        if (isAllDefined()) {
          var seconds = getSecondsFromTemplate();
          helper.setSeconds(selected, seconds);
          refresh('s');
        } else {
          invalidate();
          $scope.invalidSeconds = true;
        }
      };

      secondsInputEl.bind('blur', function(e) {
        if (!$scope.invalidSeconds && $scope.seconds < 10) {
          $scope.$apply(function() {
            $scope.seconds = pad($scope.seconds);
          });
        }
      });

    };

    this.render = function() {
      var date = new Date(0);
      if (ngModelCtrl.$modelValue) {
        date.setTime(ngModelCtrl.$modelValue.getTime());
      } else {
        date = null;
      }

      if (isNaN(date)) {
        ngModelCtrl.$setValidity('time', false);
        $log.error('Timepicker directive: "ng-model" value must be a Date object, a number of milliseconds since 01.01.1970 or a string representing an RFC2822 or ISO 8601 date.');
      } else {
        if (date) {
          selected = date;
        }
        makeValid();
        updateTemplate();
      }
    };

    // Call internally when we know that model is valid.
    function refresh(keyboardChange) {
      makeValid();
      var viewValue = new Date(0);
      viewValue.setTime(selected.getTime());
      ngModelCtrl.$setViewValue(viewValue);
      updateTemplate(keyboardChange);
    }

    function makeValid() {
      ngModelCtrl.$setValidity('time', true);
      if (selected < new Date(0)) {
        selected.setTime(0);
      }
      $scope.invalidDays = false;
      $scope.invalidHours = false;
      $scope.invalidMinutes = false;
      $scope.invalidSeconds = false;
    }

    function updateTemplate( keyboardChange ) {
      writeDaysToView();
      writeHoursToView(keyboardChange === 'h');
      writeMinutesToView(keyboardChange === 'm');
      writeSecondsToView(keyboardChange === 's');
    }
    function writeDaysToView() {
      $scope.days = helper.getDays(selected);
    }
    function writeHoursToView(withoutPadding) {
      var hours = helper.getHours(selected);
      $scope.hours = withoutPadding ? hours : pad(hours);
    }
    function writeMinutesToView(withoutPadding) {
      var minutes = helper.getMinutes(selected);
      $scope.minutes = withoutPadding ? minutes : pad(minutes);
    }
    function writeSecondsToView(withoutPadding) {
      var seconds = helper.getSeconds(selected);
      $scope.seconds = withoutPadding ? seconds : pad(seconds);
    }

    $scope.incrementDays = function() {
      helper.addDays(selected, dayStep );
      refresh();
    };
    $scope.decrementDays = function() {
      helper.addDays(selected, -dayStep );
      refresh();
    };
    $scope.incrementHours = function() {
      helper.addHours(selected, hourStep );
      refresh();
    };
    $scope.decrementHours = function() {
      helper.addHours(selected, -hourStep );
      refresh();
    };
    $scope.incrementMinutes = function() {
      helper.addMinutes(selected, minuteStep );
      refresh();
    };
    $scope.decrementMinutes = function() {
      helper.addMinutes(selected, -minuteStep );
      refresh();
    };
    $scope.incrementSeconds = function() {
      helper.addSeconds(selected, secondStep );
      refresh();
    };
    $scope.decrementSeconds = function() {
      helper.addSeconds(selected, -secondStep );
      refresh();
    };
  }])

  .directive('uibTimepicker', function () {
    return {
      restrict: 'EA',
      require: ['uibTimepicker', '?^ngModel'],
      controller: 'UibTimepickerController',
      controllerAs: 'timepicker',
      replace: true,
      scope: {},
      templateUrl: 'template/timepicker/timepicker.html',
      link: function(scope, element, attrs, ctrls) {
        var timepickerCtrl = ctrls[0], ngModelCtrl = ctrls[1];

        if (ngModelCtrl) {
          timepickerCtrl.init(ngModelCtrl, element.find('input'));
        }
      }
    };
  });

/* Deprecated timepicker below */

angular.module('ui.bootstrap.timepicker')

.value('$timepickerSuppressWarning', false)

.controller('TimepickerController', ['$scope', '$attrs', '$controller', '$log', '$timepickerSuppressWarning', function($scope, $attrs, $controller, $log, $timepickerSuppressWarning) {
  if (!$timepickerSuppressWarning) {
    $log.warn('TimepickerController is now deprecated. Use UibTimepickerController instead.');
  }

  return $controller('UibTimepickerController', {
    $scope: $scope,
    $attrs: $attrs
  });
}])

.directive('timepicker', ['$log', '$timepickerSuppressWarning', function($log, $timepickerSuppressWarning) {
  return {
    restrict: 'EA',
    require: ['timepicker', '?^ngModel'],
    controller: 'TimepickerController',
    controllerAs: 'timepicker',
    replace: true,
    scope: {},
    templateUrl: function(element, attrs) {
      return attrs.templateUrl || 'template/timepicker/timepicker.html';
    },
    link: function(scope, element, attrs, ctrls) {
      if (!$timepickerSuppressWarning) {
        $log.warn('timepicker is now deprecated. Use uib-timepicker instead.');
      }
      var timepickerCtrl = ctrls[0], ngModelCtrl = ctrls[1];

      if (ngModelCtrl) {
        timepickerCtrl.init(ngModelCtrl, element.find('input'));
      }
    }
  };
}]);
