var e;
var marker;
var lon={};lon[40]=77.195251;lon[41]=77.436265;lon[75]=77.314728;lon[39]=77.3779;lon[76]=88.365601;lon[1]=72.902746;lon[74]=80.261811;lon[36]=78.477906;lon[37]=73.845795;lon[38]=77.581834;lon[35]=77.028225;
var lat={};lat[40]=28.609732;lat[41]=28.671954;lat[75]=28.396123;lat[39]=28.548228;lat[76]=22.584735;lat[1]=19.114274;lat[74]=13.029858;lat[36]=17.394426;lat[37]=18.513352;lat[38]=12.96429;lat[35]=28.445943;
var map;
var html = '';
var legends = [{text:'High inventory required', color:'#FC7272'}, {text:'Moderate inventory required',color:'#F9F96E'}, {text:'Neutral Area', color:'#86F290'}, {text:'Moderate traffic required', color:'#9AE7ED'}, {text:'High trafic required', color: '#9797FF'}];
var typeahead_data = [];
var polygon_arr = [];
var unique=1;
var service = 'rent';
var city_id = 1;

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

var map_options = {
  zoom: 11,
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



var autocomplete_options = {componentRestrictions: {country: "in"}};
var autocomplete_input =document.getElementById('query');

function initialize() {
  update_csv_link_url();
  var map = new google.maps.Map(document.getElementById('map-canvas'), map_options);
  var marker_options = {
    map: map
  }

  var circle_options = {
    strokeColor: '#358EFB',
    strokeOpacity: 0.9,
    strokeWeight: 2,
    fillColor: '#358EFB',
    fillOpacity: 0.5,
    map: map,
    radius: 2500
  };
  map.setOptions({styles: map_styles});

  var marker = new google.maps.Marker(marker_options);
  var circle = new google.maps.Circle(circle_options);

  var autocomplete = new google.maps.places.Autocomplete(autocomplete_input, autocomplete_options);
  autocomplete.bindTo('bounds', map);

  google.maps.event.addListener(autocomplete, 'place_changed', function() {
    var place = autocomplete.getPlace();
    if (!place.geometry) {
      return;
    }
    lat_lng = place.geometry.location;
    marker.setPosition(lat_lng);
    circle.setCenter(lat_lng);
    map.setZoom(14);
    map.setCenter(lat_lng);
  });
}

google.maps.event.addDomListener(window, 'load', initialize);

function update_csv_link_url(){
  csv_url = 'http://analytics.housing.com/city_data.php?';
  csv_url = csv_url+'city='+window.city_id+'&';
  csv_url = csv_url+'service='+window.service;
  $('.csv-link').attr('href', csv_url);
}

$(document).ready(function(){
  $('.city-menu .city').click(function(e){
    e.stopPropagation();
    e.preventDefault();
    window.city_id = $(this).data('value');
    $('.city-menu .city').removeClass('active');
    $(this).addClass('active');
    $('#info .apartment_type_info, #info .price_info').html('');
    $('#info, .map-wrap').removeClass('animate');
    $('#message').hide();
    update_csv_link_url();
    initialize();
  });

  $('.controls-wrap .control').click(function(e){
    e.stopPropagation();
    e.preventDefault();
    window.service = $(this).data('type');
    $('.controls-wrap .control').removeClass('active');
    $(this).addClass('active');
    $('#info, .map-wrap').removeClass('animate');
    $('#message').hide();
    update_csv_link_url();
    initialize();
  });

  $('#info').on('click', '.list-header', function(){
      if(!$(this).closest('ul').hasClass('un_expandable')){
        if($(this).closest('ul').hasClass('expanded'))
            $(this).closest('ul').removeClass('expanded');
        else{
            $('.has-children').removeClass('expanded');
            $(this).closest('ul').addClass('expanded');
        }
      }
  });
  tmp = ''
  $(legends).each(function(i,legend){
    wrap_div = $('<div/>')
    .addClass('legend')
    .append($('<span/>').addClass('color-wrap').css({'background-color': legend.color}))
    .append($('<span/>').addClass('legend-txt').text(legend.text))
    .appendTo('.legends-wrap');
  });
});
