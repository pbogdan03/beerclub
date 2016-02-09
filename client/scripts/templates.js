exports['beerPost']=function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<div class="beer-post__info"> <h3 class="beer-post__title"><a href="'+
((__t=( breweryUrl ))==null?'':__t)+
'">'+
((__t=( title ))==null?'':__t)+
'</a></h3> <p class="beer-post__description">'+
((__t=( description ))==null?'':__t)+
'</p> <p class="beer-post__rating">Rating: '+
((__t=( userRating ))==null?'':__t)+
'</p> <p class="beer-post__user">Created by: '+
((__t=( createdBy.username ))==null?'':__t)+
'</p> </div>';
}
return __p;
};
exports['loading']=function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<div class="loading__spinner"></div>';
}
return __p;
};
exports['main']=function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<div class="container header"> <h1><a href="#" class="header__title">Beerclub</a></h1> </div> <div class="container posts"> <div class="row"> <div class="col-md-12"> <h2>Beers</h2> </div> </div> </div>';
}
return __p;
};