var colleges_data = null;
var rich_marker_arr = [];
// var circle_options = {
//   strokeColor: '#000',
//   strokeOpacity: 0.9,
//   strokeWeight: 2,
//   fillColor: '#000',
//   fillOpacity: 0.2,
//   radius: 2500
// };

// var autocomplete_options = {componentRestrictions: {country: "in"}};
// var autocomplete_input =document.getElementById('locality-filter');
// var circle = null;
// var circle_marker = null;
// var autocomplete = null; 

function initialize() {
  map = new google.maps.Map(document.getElementById('map-canvas'), map_options);
  map.setOptions({styles: map_styles});
  draw(window.city_id);
  marker = new google.maps.Marker({map: map});
  // circle = new google.maps.Circle(circle_options);

  // autocomplete = new google.maps.places.Autocomplete(autocomplete_input, autocomplete_options);
  // autocomplete.bindTo('bounds', map);
  // circle_marker_options ={
  //   flat: true,
  //   ZIndex: 1050,
  //   // draggable: true,
  //   anchor: RichMarkerPosition.MIDDLE,
  //   content: '<div class="circle-marker small"><span class="marker-ico glyphicon glyphicon-record"></span></div>'
  // };
  // circle_marker = new RichMarker(circle_marker_options);
  // google.maps.event.addListener(circle_marker, 'position_changed', function() {
  //   circle.setCenter(circle_marker.getPosition());
  // });

  // google.maps.event.addListener(autocomplete, 'place_changed', function() {
  //   var place = autocomplete.getPlace();
  //   if (!place.geometry) {
  //     return;
  //   }
  //   lat_lng = place.geometry.location;
  //   circle_marker.setOptions({position:lat_lng, map:map})
  //   circle.setOptions({center:lat_lng, map:map});
  //   map.setZoom(14);
  //   map.setCenter(lat_lng);
  // });
}

google.maps.event.addDomListener(window, 'load', initialize);

function draw(city_id){
  destroy_polygons();
  $.ajax({
    url:'http://analytics.housing.com/heatmap_lead_invent.php?city=1',
    type:'get',
    data:  {city:city_id}
  })
  .done(function(data){
    data = $.parseJSON(data)
    console.log(data);
    keys = Object.keys(data);
    $(keys).each(function(i,key){
        obj = data[key];
        tmp={};
        lat_lng = {};
        tmp['locality_name'] = obj.locality_name;
        tmp['lat'] = obj.lat;
        tmp['lng']  = obj.lon;
        typeahead_data.push(tmp);
        addPolygon(obj,key)
    });
    $(document).trigger('data:fetched')
  });
}

$(document).ready(function(){

  $(document).on('city:changed', function(e, city_id){
    window.city_id = city_id;
    map.setOptions({center:new google.maps.LatLng(lat[window.city_id],lon[window.city_id]), zoom:11});
    $(document).trigger('show:colleges');
    draw(window.city_id);
    // circle.setMap(null);
    // circle_marker.setMap(null);
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
          anchor: RichMarkerPosition.BOTTOM,
          content: '<div class="rich-marker small"><span class="marker-ico glyphicon glyphicon-record"></span><span class="marker-wrap"><span class="glyphicon glyphicon-map-marker"></span><span class="marker-text">'+key+'</span></span></div>'
        };
        rich_marker = new RichMarker(rich_marker_options);
        google.maps.event.addListener( rich_marker, 'mouseover', function(event) {
          this.setOptions({ZIndex:1000})
        });
        google.maps.event.addListener( rich_marker, 'mouseout', function(event) {
          this.setOptions({ZIndex:1});
        });
        rich_marker_arr.push(rich_marker)
      }
    });
  });

  $('.city-menu .city').click(function(e){
    e.stopPropagation();
    e.preventDefault();
    // autocomplete_input.blur();    
    // setTimeout(function(){ autocomplete_input.value = ''; autocomplete_input.focus(); }, 100);
    $(document).trigger('city:changed', [$(this).data('value')])
  });

  $.get('colleges.json')
  .done(function(data){
    if(typeof data == 'string')
      colleges_data = JSON.parse(data);
    else
      colleges_data = data;
    $(document).trigger('show:colleges');
  });
});