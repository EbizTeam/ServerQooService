$(document).click(function (event) {
if ($(event.target).parents(".navbar-collapse").length < 1) {
    var clickover = $(event.target);
    var $navbar = $(".navbar-collapse");               
    var _opened = $navbar.hasClass("in");
    if (_opened === true && !clickover.hasClass("navbar-toggle")) {      
        $navbar.collapse('hide');
    }
  }
});
                                $('#m2').click(function() {
      $('#menu1').collapse('hide');
    });
                                
                                $('#m1').click(function() {
      $('#menu2').collapse('hide');
    });