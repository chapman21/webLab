angular.module("KnowledgePortal", ['ngResource','directives','dmvPortalConfig','globals', 'factories'])//.value('$anchorScroll', angular.noop)

.config(['$routeProvider','$locationProvider','$httpProvider', function($routeProvider,$locationProvider, $httpProvider){
			$httpProvider.defaults.headers.get = {
				'Accept' : 'application/json, text/javascript, */*'
			};
			$routeProvider
					.when('/ContactUs', {
						controller : 'StepOneController',
						templateUrl : 'views/stepOne.html'
					})
					.when('/StepTwo', {
						controller : 'StepTwoController',
						templateUrl : 'views/stepTwo.html'
					})
					.when('/Verify', {
						controller : 'VerifyController',
						templateUrl : 'views/confirmation.html'
					})
					.when('/Complete', {
						controller : 'CompleteController',
						templateUrl : 'views/complete.html'
					})
					.otherwise({
						redirectTo : '/ContactUs'
					});
}])

.controller('StepOneController', ['$scope','$location','$timeout', function($scope, $location, $timeout){
	sessionStorage.removeItem('vehicles');
	sessionStorage.removeItem('drivers');
	if(sessionStorage.stepOne){
		var one = sessionStorage.getItem('stepOne');
		var cdOne = JSON.parse(one);
		var formFill = {
			fillIt : function() {
				$scope.email = cdOne.email;
				$scope.fn  = cdOne.firstname;
				$scope.lastname  = cdOne.lastname;
				$scope.phone  = cdOne.phone;
				$scope.suffix = cdOne.suffix;
				$scope.subject = cdOne.subject;
			}
		};
		$timeout(formFill.fillIt, 100);
	}
			$scope.setText = function(x){
				var s = $("#sub option[value='" +  x + "']").text();
				sessionStorage.subj = s;
			};
			$scope.next = function(){
				_gaq.push(['_trackEvent', 'Contact Form Started!', 'ContactUs']);
				var stepOne = {
					suffix : $scope.suffix,
					firstname : $scope.fn,
					lastname : $scope.lastname,
					phone : $scope.phone,
					email : $scope.email,
					subject : $scope.subject
				};
				if($scope.subject === "vi"){
					sessionStorage.vehicles = true;
				}
				if($scope.subject === "di" || $scope.subject === "vi" || $scope.subject === "su"){
					sessionStorage.drivers = true;
				}
				sessionStorage.setItem('stepOne', JSON.stringify(stepOne));
				if(sessionStorage.complete){
					$location.path('/Verify')
				}else{
					$location.path("/StepTwo");
				}
			}
}])

.controller('StepTwoController', ['$scope','$location','$timeout', function($scope, $location, $timeout){
			if(!sessionStorage.stepOne){
				$location.path("/StepOne");
			}
			if(sessionStorage.vehicles){
				$scope.vehicles = true;
			}
			if(sessionStorage.drivers){
				$scope.drivers = true;
			}
   if(sessionStorage.stepTwo){
       var two = sessionStorage.getItem('stepTwo');
       var cdTwo = JSON.parse(two);
       var formFill = {
        fillIt : function() {
                $scope.title = cdTwo.title;
                $scope.vin = cdTwo.vin;
                 $scope.plate = cdTwo.plate;
                $scope.custnumber = cdTwo.custnumber;
                $scope.description = cdTwo.description;
            }
        }
     $timeout(formFill.fillIt, 100);
   
   }
   
    $scope.next = function(){
        var stepTwo = {
            title : $scope.title,
            vin : $scope.vin,
            plate : $scope.plate,
            custnumber : $scope.custnumber,
            description :  $scope.description
        };
        sessionStorage.setItem('stepTwo', JSON.stringify(stepTwo));
        $location.path("/Verify")
    };
     $scope.back = function() {
        $location.path("/StepOne")
    };
  
    $scope.change = function() {
        var a = $scope.description;
        if (a) {
            $scope.left = 500 - a.length + " chracters remaining";
        } else {
            $scope.left = "500 character limit";
        }
    };
    
    
    
   
        //$scope.mail = cdOne.email
    
}])

.controller('VerifyController',['$scope','$location','ContactFactory', function($scope, $location, ContactFactory){
			var one;
			var two;
			var cdOne;
			var cdTwo;
			var data;
			$scope.verify = true;
			if(!sessionStorage.stepOne && !sessionStorage.stepTwo){
				$location.path("/StepOne");
			}else{
				one = sessionStorage.getItem('stepOne');
				two = sessionStorage.getItem('stepTwo');
				cdOne = JSON.parse(one);
				cdTwo = JSON.parse(two);
				data = {
					firstname  : cdOne.firstname,
					lastname  : cdOne.lastname,
					phone  : cdOne.phone,
					email : cdOne.email,
					suffix : cdOne.suffix,
					subject : cdOne.subject,
					realSubject : sessionStorage.subj,
					title : cdTwo.title,
					vin : cdTwo.vin,
					plate : cdTwo.plate,
					custnumber : cdTwo.custnumber,
					description : cdTwo.description
				};
			if(cdOne.subject === 'ot'){
				data.realSubject = undefined;
			}
			if(cdOne.phone !== undefined && cdOne.phone.indexOf('804-555') !==-1){
				data.phone = undefined;
			}
				$scope.subj = sessionStorage.subj;
				$scope.mail = data.email;
				$scope.theData = [data];
				var DTO ={
         "oContactUsFields":data 
         
        };
        $scope.addResponse = function(x) {
           
         data.response = x;
        
    };
    $scope.addEmail = function(y) {
          data.getEmail = y;
    };
    }
			$scope.edit = function(x){
				sessionStorage.complete = "yes";
				$location.path('/' + x)
			}
    $scope.next = function(){
         $scope.isloading = true;
          sessionStorage.setItem('data', JSON.stringify(data));
        ContactFactory.contactInfo({}, DTO, successcb, errorcb);
    };
    $scope.goTo = function(x){
        $location.path(x) 
    };
     function successcb(data){
         $scope.verify = false;
         $location.path('/Complete');
         //sessionStorage.clear();
         
     }
     function errorcb(data){
          $scope.err = data.status
     }
}])

.controller('CompleteController',['$scope','$location','$timeout', function($scope, $location, $timeout){
    var theData;
    var formFill;
    if(!sessionStorage.stepOne && !sessionStorage.stepTwo && !sessionStorage.data){
      $location.path("/StepOne");
   }else{
        theData = sessionStorage.getItem('data');
        data = JSON.parse(theData);
        $scope.theData = [data];
        _gaq.push(['_trackEvent', 'Contact Form Completed!', 'ContactUs']);
         formFill = {
        fillIt : function() {
                sessionStorage.clear();
            }
        }
     $timeout(formFill.fillIt, 1500);
        
          $scope.goHome = function(x){
        sessionStorage.clear();
        window.location.replace(x);
    }; 
   }

}])


.animation('an-enter', function() {
        return {
            setup : function(myElement) {
                myElement.css({ 'opacity': 0.3 });
                return {}; //if you want to share some dat between the set and start return it it can be anything
            },
            start : function(myElement, done, data) {
                myElement.animate({
                    'opacity' : 1
                }, 300, function(){
                    done()
                });
            }
        }
        })
        
     ;var base = "views/directiveTemplates/";
angular.module("directives", [])




/*

.directive('loginDetails', function () {
      return {
         restrict: "A",
         replace: true,
         scope:{
             number : "@number"
         },
         templateUrl:"views/directiveTemplates/loginDetails.html" 
        }
     })

*/


.directive('placeholder', ['$timeout', function($timeout){
      if (navigator.userAgent.indexOf("MSIE") < 0) {
        return{
            
        }
    }
   if(/MSIE (\d+\.\d+);/.test(navigator.userAgent)){
       var s = new Number(RegExp.$1);
       if (s > 10) {
           return
           }else{
               return {
                   link: function(scope, elm, attrs){
                       if (attrs.type === 'password'){
                           return;
                           }
                           $timeout(function(){
                               elm.val(attrs.placeholder).focus(function(){
                                   if ($(this).val() == $(this).attr('placeholder')) {
                                       $(this).val('');
                                       }
                                       }).blur(function(){
                                           if ($(this).val() == ''){
                                               $(this).val($(this).attr('placeholder'));
                                               }});});
                                          }}}}}])
                                          
                                          


.directive('button', function(){
    return{
        restrict: 'E',
        compile: function(element, attributes){
            element.addClass('orgBtn')
        }
    };
})




.directive('custnumber', ['$parse',function($parse, $templateCache){
    return{
        restrict: "A",
        link: function(scope, elm, iAttrs, controller) {
            var a = $('input').attr('name');
            scope.$watch(a, function(value) {
                if (!value) {
                    return;
                }
                if(value.indexOf("-") !==-1 && value.length === 11){
                     $parse(a).assign(scope, value.replace(/-/g, ''));
                }
            });
        }
    }
}])




/*

.directive('vin', function(){
    return{
        restrict: "E",
        replace: true,
        templateUrl:base + "vin.html",
         link: function(scope, elm, attrs){
         }
    };
})




.directive('description', function(){
    return{
        restrict: "E",
        replace: true,
        templateUrl:base + 'description.html'
    }
})




.directive('yesno', function(){
    return{
        restrict: "E",
        replace: true,
          templateUrl:base + 'yesnoRadio.html'
        
    };
});

*/












;angular.module("dmvPortalConfig", [])

.config(['$provide','$httpProvider','$compileProvider', function($provide, $httpProvider, $compileProvider) {
    var check;
    var y = window.location.host;
    var elementsList = $();
    var token;
    var showMessage = function(content, cl, time, loading) {
        var a = loading;
        $('<h2>').addClass('message').addClass(cl).appendTo(elementsList).text(content);
    };
    $httpProvider.responseInterceptors.push(['$timeout','$q', 'message','$location', '$window', function($timeout, $q, message,$location, $window){
         var redirectTo = {
        SampleKnowledgeExam: function() {
            $location.path("/SampleKnowledgeExam")
        }
    };
        
        return function(promise) {
            var a = sessionStorage.id;
            if ($('div.messagesList').length) {
                $('div.messagesList').empty();
                showMessage('Loading...', 'loadingMessage', 50000);
            } else {
                showMessage('Loading...', 'loadingMessage', 50000);
            }
            return promise.then(function(response) {
                if (response) {
                    $('h2.loadingMessage').fadeOut(1040);
                }
                check = response.headers('x-auth-token');
                if (check !== null && check !== undefined) {
                    token = response.headers('x-auth-token');
                    sessionStorage.id = token;
                    credStore.push(token);
                    var toke = credStore.shift();

                    $httpProvider.defaults.headers.common = {
                        "X-Auth-Token" : toke

                    };
                    $httpProvider.defaults.headers.common = {
                        'Accept' : 'application/json, text/plain, * / *'
                    };

                }

                if (a) {

                    $httpProvider.defaults.headers.get = {
                        'Accept' : 'application/json, text/javascript, */*',
                        'X-Auth-Token' : a

                    }
                    
                    $httpProvider.defaults.headers.post = {
                        'Accept' : 'application/json, text/javascript, */*',
                        "Content-Type" : "application/json; charset=utf-8",
                        'X-Auth-Token' : a

                    }
                     $httpProvider.defaults.headers.put = {
                        'Accept' : 'application/json, text/javascript, */*',
                        "Content-Type" : "application/json; charset=utf-8"

                    }
                }
                return promise

            }, function(errorResponse) {
                var e = errorResponse.data;
                switch(errorResponse.status){
                    case 404:
                        $('div.messagesList').empty();
                        sessionStorage.clear()
                        showMessage(e.STATUS, 'errorMessage', 20000);
                        //$timeout(redirectTo.SampleKnowledgeExam, 2000);
                        break;
                    case 500:
                        $('div.messagesList').empty();
                        sessionStorage.clear()
                        showMessage(e.STATUS, 'errorMessage', 20000);
                        //$timeout(redirectTo.SampleKnowledgeExam, 2000);
                        break;
                    default:
                        showMessage('Error ' + errorResponse.status + ': ' + errorResponse.data, 'errorMessage', 20000);
                }
                return $q.reject(errorResponse);
            });
        };
    }]);
    $compileProvider.directive('appMessages', function() {
        var directiveDefinitionObject = {
            restrict : 'A',
            template : "<div></div>",
            replace : true,
            link : function(scope, element, attrs) {
                elementsList.push($(element));
            }
        };
        return directiveDefinitionObject;
    });

}]); ;angular.module("factories", [])




.factory('message', function() {
    return []
})


.factory('ContactFactory',['$resource', function($resource) {
    var baseUrl = "/apps/ContactUs/Default.aspx/SendFields";
    return $resource(baseUrl, {}, {
        contactInfo : {
            method : 'Post',
            url : baseUrl
        }
    });
}]);























