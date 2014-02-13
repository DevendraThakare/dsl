var lon={};lon[40]=77.195251;lon[41]=77.436265;lon[75]=77.314728;lon[39]=77.3779;lon[76]=88.365601;lon[1]=72.902746;lon[74]=80.261811;lon[36]=78.477906;lon[37]=73.845795;lon[38]=77.581834;lon[35]=77.028225;
var lat={};lat[40]=28.609732;lat[41]=28.671954;lat[75]=28.396123;lat[39]=28.548228;lat[76]=22.584735;lat[1]=19.114274;lat[74]=13.029858;lat[36]=17.394426;lat[37]=18.513352;lat[38]=12.96429;lat[35]=28.445943;
var unique=1;
var legends = [{text:'High inventory required', color:'#FC7272'}, {text:'Moderate inventory required',color:'#F9F96E'}, {text:'Neutral Area', color:'#86F290'}, {text:'Moderate traffic required', color:'#9AE7ED'}, {text:'High trafic required', color: '#9797FF'}];
var typeahead_data = [];
var polygon_arr = [];
var service = 'rent';
var city_id = 1;
var city_map = {'1':'mumbai', '40':'delhi', '35':'gurgaon', '37':'pune', '75':'faridabad', '41':'ghaziabad', '39':'noida', '36':'hyderabad', '74':'chennai', '38':'bangalore', '76':'kolkata'}
var html='';
var map_styles= [
  {
  featureType: "all",
  elementType: "all",
  stylers: [{saturation: -80}]
  }
,
  {
  featureType: "water",

  elementType: "all",

  stylers: [{lightness: -25}]
  }
,
  {
  featureType: "transit.line",

  stylers: [{visibility: "off"}]
  }
,   
  {
  featureType: 'administrative',

  stylers: [{visibility: "simplified"}]
  }
,{ featureType: "road", stylers: [ { visibility: "off" } ] }
];

var map = null;

var map_options = {
  zoom: 11,
  minZoom:10,
  panControl: false,
  zoomControl: false,
  mapTypeControl: false,
  scaleControl: false,
  streetViewControl: false,
  overviewMapControl: false,
  center: new google.maps.LatLng(lat[window.city_id],lon[window.city_id]),
  mapTypeControlOptions: {
    style: map_styles
  }
};

var tooltip = function(){
  var id = 'tt';
  var top = 3;
  var left = 3;
  var maxw = 300;
  var speed = 10;
  var timer = 20;
  var endalpha = 95;
  var alpha = 0;
  var tt,t,c,b,h;
  var ie = document.all ? true : false;
  return{
    show:function(v,w){
      if(tt == null){
        tt = document.createElement('div');
        tt.setAttribute('id',id);
        t = document.createElement('div');
        t.setAttribute('id',id + 'top');
        c = document.createElement('div');
        c.setAttribute('id',id + 'cont');
        b = document.createElement('div');
        b.setAttribute('id',id + 'bot');
        tt.appendChild(t);
        tt.appendChild(c);
        tt.appendChild(b);
        document.body.appendChild(tt);
        tt.style.opacity = 0;
        tt.style.filter = 'alpha(opacity=0)';
        document.onmousemove = this.pos;
      }
      tt.style.display = 'block';
      tt.style.position = 'absolute';
      c.innerHTML = v;
      tt.style.width = w ? w + 'px' : 'auto';
      if(!w && ie){
        t.style.display = 'none';
        b.style.display = 'none';
        tt.style.width = tt.offsetWidth;
        t.style.display = 'block';
        b.style.display = 'block';
      }
      if(tt.offsetWidth > maxw){tt.style.width = maxw + 'px'}
      h = parseInt(tt.offsetHeight) + top;
      clearInterval(tt.timer);
      tt.timer = setInterval(function(){tooltip.fade(1)},timer);
    },
    pos:function(e){
      var u = ie ? event.clientY + document.documentElement.scrollTop : e.pageY;
      var l = ie ? event.clientX + document.documentElement.scrollLeft : e.pageX;
      tt.style.top = (u - h) + 'px';
      tt.style.left = (l + left) + 'px';
    },
    fade:function(d){
      var a = alpha;
      if((a != endalpha && d == 1) || (a != 0 && d == -1)){
        var i = speed;
        if(endalpha - a < speed && d == 1){
          i = endalpha - a;
        }else if(alpha < speed && d == -1){
          i = a;
        }
        alpha = a + (i * d);
        tt.style.opacity = alpha * .01;
        tt.style.filter = 'alpha(opacity=' + alpha + ')';
      }else{
        clearInterval(tt.timer);
        if(d == -1){tt.style.display = 'none'}
      }
    },
    hide:function(){
      clearInterval(tt.timer);
      tt.timer = setInterval(function(){tooltip.fade(-1)},timer);
    }
  };
}();

function destroy_polygons(){
  _.each(polygon_arr, function(polygon){
    polygon.setMap(null);
  });
  polygon_arr.length = 0;
}

function showAlerts(){
  $('.is-child.invent').each(function(i, el){
    inv = $(this).data('value');
    dem = $(this).siblings('.demand').data('value');
    if(dem > inv)
      $(this).closest('.has-children').addClass('alert');
  });
}

$(document).ready(function(){
  $('.city-menu .city').click(function(e){
    e.stopPropagation();
    e.preventDefault();
    $('.city-menu .city').removeClass('active');
    $(this).addClass('active');
    $('#info .apartment_type_info, #info .price_info').html('');
    $('#info, .map-wrap').removeClass('animate');
    $('#message').hide();
    $(document).trigger('city:changed', [$(this).data('value')]);
  });

  $('.legends-wrap').html('');
  $(legends).each(function(i,legend){
    wrap_div = $('<div/>')
    .addClass('legend')
    .append($('<span/>').addClass('color-wrap').css({'background-color': legend.color}))
    .append($('<span/>').addClass('legend-txt').text(legend.text))
    .appendTo('.legends-wrap');
  });

  $(document).on('data:fetched', function(){
    $('#query').typeahead({
      name: city_id,
      valueKey: 'locality_name',
      local: typeahead_data
    });
    $('#query').on('typeahead:selected', function (object, datum) {
      poly = $(polygon_arr).filter(function(i,n){
        if(n.lat == datum.lat && n.lng == datum.lng)
          return true;
        else
          return false;
      });
      google.maps.event.trigger(poly[0], 'click', {latLng:new google.maps.LatLng(datum.lat,datum.lng)});
      marker.setOptions({map : map, position : new google.maps.LatLng(datum.lat, datum.lng)});
    });
  });

});