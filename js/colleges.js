var college_office_data = null;
var rich_marker_arr = [];

function initialize() {
  map = new google.maps.Map(document.getElementById('map-canvas'), map_options);
  map.setOptions({styles: map_styles});
  draw(window.city_id);
  marker = new google.maps.Marker();
}

function draw(city_id){
  destroy_polygons();
  destroy_rich_markers();
  $('#query').typeahead('destroy').val('');
  $.ajax({
    url:'http://analytics.housing.com/heatmap_lead_invent.php?city=1',
    type:'get',
    data:  {city:city_id}
  })
  .done(function(data){
    data = $.parseJSON(data)
    keys = Object.keys(data);
    typeahead_data = [];
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
    $(document).trigger('data:fetched');
  });

  $.get('http://analytics.housing.com/get_insti.php?city='+city_id)
  .done(function(data){
    if(typeof data == 'string')
      college_office_data = JSON.parse(data);
    else
      college_office_data = data;
    $(document).trigger('show:colleges');
  });
}

function addPolygon(obj,locality_id){
  polygon = obj['encoded_polygon'];
  decodePolygonMK2(locality_id, polygon, obj['color'],obj['apartment_type_data'], obj['price_data'],obj['locality_name'],obj['ratio'],obj['status'],obj['lat'], obj['lon']).setMap(window.map);
}

decodePolygonMK2 = function(locality_id, t, c, apartment_type_data, price_data, locality, ratio, status, lat, lng) {
  var e = t.length, i = 0, n = [], o = 0, a = 0, s = false, r = google.maps.LatLng;
  while (i < e) {
      var l, p = 0, h = 0;
      do {
          l = t.charCodeAt(i++) - 63;
          h |= (l & 31) << p;
          p += 5
      } while (l >= 32);
      a += h & 1 ? ~(h >> 1) : h >> 1;
      if (a > 180 * 1e6 || a < -(180 * 1e6)) {
          s = true
      }
      p = 0;
      h = 0;
      do {
          l = t.charCodeAt(i++) - 63;
          h |= (l & 31) << p;
          p += 5
      } while (l >= 32);
      o += h & 1 ? ~(h >> 1) : h >> 1;
      s = o > 90 * 1e6 || o < -(90 * 1e6) ? 1e7 : 1e6;
      
      n.push(new r(a * 10 / s,o * 10/ s))
  }

  poly = new google.maps.Polygon({
    paths: n,
    strokeColor: '#A0A0A0',
    strokeWeight: 1,
    fillColor: c,
    fillOpacity: 0.8
  });

  google.maps.event.addListener(poly, 'mouseover', function(event) {
    apartment_type_data_obj = $.parseJSON(apartment_type_data);
    this.setOptions({fillOpacity : 1.0,  strokeColor: '#A0A0A0', strokeWeight:2});
    tooltip_html = '<div class="tt-header">'+locality+'</div><div class="tt-content">';
    if(apartment_type_data_obj!=null){
      tooltip_html = tooltip_html + '<div class="tt-inventory"><span class="key">Total Inventory </span><span class="value">'+apartment_type_data_obj["inventory"]+'</span></div>';
      if(apartment_type_data_obj["opencrf_leads"]!=null)
        tooltip_html = tooltip_html + '<div class="tt-crf-leads"><span class="key">Open CRF Leads</span><span class="value">'+apartment_type_data_obj["opencrf_leads"]+'</span></div>';
      if(apartment_type_data_obj["pyr_leads"]!=null)
        tooltip_html = tooltip_html + '<div class="tt-pyr-leads"><span class="key">PYR Leads</span><span class="value">'+apartment_type_data_obj["pyr_leads"]+'</span></div>';
    }
    else{
      tooltip_html = tooltip_html + '<div class="tt-inventory"><span class="key">Total Inventory </span><span class="value">'+0+'</span></div>';
      tooltip_html = tooltip_html + '<div class="tt-crf-leads"><span class="key">Open CRF Leads</span><span class="value">'+0+'</span></div>';
      tooltip_html = tooltip_html + '<div class="tt-pyr-leads"><span class="key">PYR Leads</span><span class="value">'+0+'</span></div>';
    }
    tooltip_html = tooltip_html + '</div>';
    tooltip.show(tooltip_html);
  });
  google.maps.event.addListener(poly, 'mouseout', function(event){
    tooltip.hide();
    this.setOptions({fillOpacity : 0.8, strokeWeight:1});
  });
  poly['lat'] = lat;
  poly['lng'] = lng;
  polygon_arr.push(poly)
  return poly;
}

google.maps.event.addDomListener(window, 'load', initialize);

function destroy_rich_markers(){
  _.each(rich_marker_arr, function(r_marker){
    r_marker.setMap(null);
  });
  rich_marker_arr.length = 0;
}

function draw_rich_marker(type, obj,key){
  if(type == 'office')
    content = '<div class="rich-marker office"><span class="marker-ico glyphicon glyphicon-record"></span><span class="marker-wrap"><span class="glyphicon glyphicon-map-marker"></span><span class="marker-text">'+key+'</span></span></div>';
  else
    content = '<div class="rich-marker college"><span class="marker-ico glyphicon glyphicon-record"></span><span class="marker-wrap"><span class="glyphicon glyphicon-map-marker"></span><span class="marker-text">'+key+'</span></span></div>';
  rich_marker_options ={
    position: new google.maps.LatLng(obj.lat, obj.lng),
    flat: true,
    map:map,
    anchor: RichMarkerPosition.BOTTOM_LEFT,
    content: content
  };
  rich_marker = new RichMarker(rich_marker_options);
  google.maps.event.addListener( rich_marker, 'mouseover', function(event) {
    this.setOptions({ZIndex:1000})
  });
  google.maps.event.addListener( rich_marker, 'mouseout', function(event) {
    this.setOptions({ZIndex:1});
  });
  rich_marker_arr.push(rich_marker);
}

$(document).ready(function(){

  $(document).on('city:changed', function(e, city_id){
    window.city_id = city_id;
    map.setOptions({center:new google.maps.LatLng(lat[window.city_id],lon[window.city_id]), zoom:11});
    marker.setMap(null);
    $(document).trigger('show:colleges');
    draw(window.city_id);
  });

  $(document).on('show:colleges', function(){
    city_colleges = college_office_data['college'];
    city_offices = college_office_data['office'];
    if(map){
      _.each(city_colleges, function(obj, key){
        draw_rich_marker('college', obj, key);
      });
      _.each(city_offices, function(obj, key){
        draw_rich_marker('office', obj, key)
      });
    }
  });
});