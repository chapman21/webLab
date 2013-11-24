angular.module("odomFraud", ['ngResource','directives','dmvPortalConfig', 'factories', 'portalCancel'])//.value('$anchorScroll', angular.noop)




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
        templateUrl : 'views/verify.html'
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
              $scope.firstname  = cdOne.firstname;
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
            firstname : $scope.firstname,
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
        $location.path("/StepTwo");
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
    $scope.contact = [data];
    
   
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
        
     