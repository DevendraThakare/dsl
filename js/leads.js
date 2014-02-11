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
var colleges_data = null;
var city_map = {'1':'mumbai', '40':'delhi', '35':'gurgaon', '37':'pune', '75':'faridabad', '41':'ghaziabad', '39':'noida', '36':'hyderabad', '74':'chennai', '38':'bangalore', '76':'kolkata'}
rich_marker_arr = [];
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

var marker_options = {
  map: map
}

var circle_options = {
  strokeColor: '#358EFB',
  strokeOpacity: 0.9,
  strokeWeight: 2,
  fillColor: '#358EFB',
  fillOpacity: 0.5,
  radius: 2500
};



var autocomplete_options = {componentRestrictions: {country: "in"}};
var autocomplete_input =document.getElementById('locality-filter');
var map = null;
var autocomplete = null; 

function initialize() {
  map = new google.maps.Map(document.getElementById('map-canvas'), map_options);
  map.setOptions({styles: map_styles});

  // var marker = new google.maps.Marker(marker_options);
  var circle = new google.maps.Circle(circle_options);
  circle.setOptions({map:map});

  autocomplete = new google.maps.places.Autocomplete(autocomplete_input, autocomplete_options);
  autocomplete.bindTo('bounds', map);

  google.maps.event.addListener(autocomplete, 'place_changed', function() {
    var place = autocomplete.getPlace();
    if (!place.geometry) {
      return;
    }
    lat_lng = place.geometry.location;
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

  $(document).on('city:changed', function(e, city_id){
    window.city_id = city_id;
    map.setOptions({center:new google.maps.LatLng(lat[window.city_id],lon[window.city_id]), zoom:11});
    $(document).trigger('show:colleges');
  });

  $(document).on('show:colleges', function(){
    city_colleges = colleges_data[city_map[window.city_id]];
    _.each(rich_marker_arr, function(r_marker){
      r_marker.setMap(null);
    });
    rich_marker_arr.length = 0;
    _.each(city_colleges, function(obj, key){
      if(map){
        rich_marker_options ={
          position: new google.maps.LatLng(obj.lat, obj.lon),
          flat: true,
          map:map,
          anchor: RichMarkerPosition.MIDDLE,
          content: '<div class="rich-marker small"><span class="marker-ico glyphicon glyphicon-record"></span><span class="marker-wrap"><span class=" glyphicon glyphicon-map-marker"></span><span class="marker-text">'+key+'</span></span></div>'
        };
        rich_marker = new RichMarker(rich_marker_options);
        rich_marker_arr.push(rich_marker)
      }
    });
  });

  $('.city-menu .city').click(function(e){
    e.stopPropagation();
    e.preventDefault();
    $('.city-menu .city').removeClass('active');
    $(this).addClass('active');
    $('#info .apartment_type_info, #info .price_info').html('');
    $('#info, .map-wrap').removeClass('animate');
    $('#message').hide();
    autocomplete_input.blur();    
    setTimeout(function(){ autocomplete_input.value = ''; autocomplete_input.focus(); }, 100);
    $(document).trigger('city:changed', [$(this).data('value')])
  });

  $.get('colleges.json')
  .done(function(data){
    colleges_data = JSON.parse(data);
    $(document).trigger('show:colleges');
  });

  // $('.controls-wrap .control').click(function(e){
  //   e.stopPropagation();
  //   e.preventDefault();
  //   window.service = $(this).data('type');
  //   $('.controls-wrap .control').removeClass('active');
  //   $(this).addClass('active');
  //   $('#info, .map-wrap').removeClass('animate');
  //   $('#message').hide();
  // });

  // $('#info').on('click', '.list-header', function(){
  //   if(!$(this).closest('ul').hasClass('un_expandable')){
  //     if($(this).closest('ul').hasClass('expanded'))
  //       $(this).closest('ul').removeClass('expanded');
  //     else{
  //       $('.has-children').removeClass('expanded');
  //       $(this).closest('ul').addClass('expanded');
  //     }
  //   }
  // });

  // $(legends).each(function(i,legend){
  //   wrap_div = $('<div/>')
  //   .addClass('legend')
  //   .append($('<span/>').addClass('color-wrap').css({'background-color': legend.color}))
  //   .append($('<span/>').addClass('legend-txt').text(legend.text))
  //   .appendTo('.legends-wrap');
  // });
});