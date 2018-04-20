$(document).ready(function(){
    var scrollers = document.getElementsByClassName('scroller');

    var scrollerDivs = Array.prototype.filter.call(scrollers, function(testElement) {
      return testElement.nodeName === 'DIV';
    });

    function scrollAll(scrollLeft) {
      scrollerDivs.forEach(function(element, index, array) {
        element.scrollLeft = scrollLeft;
      });
    }

    scrollerDivs.forEach(function(element, index, array) {
      element.addEventListener('scroll', function(e) {
        scrollAll(e.target.scrollLeft);
      });
    });
});