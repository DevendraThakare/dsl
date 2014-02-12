function draw(city_id,service){
  destroy_polygons();
  $.ajax({
    url:'http://analytics.housing.com/heatmap.php',
    type:'get',
    data:  {city:city_id, type: service}
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
        addPolygon(obj, key)
    });
    $(document).trigger('data:fetched')
  });
}

function initialize() {
    update_csv_link_url();
    map = new google.maps.Map(document.getElementById('map-canvas'), map_options);
    map.setOptions({styles: map_styles});
    draw(window.city_id, window.service);
    marker = new google.maps.Marker({map: map});
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
    update_csv_link_url();
    map.setOptions({center:new google.maps.LatLng(lat[window.city_id],lon[window.city_id]), zoom:11});
    draw(window.city_id, window.service);
  });

  $(document).on('service:changed', function(e, service){
    window.service = service;
    update_csv_link_url();
    map.setOptions({center:new google.maps.LatLng(lat[window.city_id],lon[window.city_id]), zoom:11});
    draw(window.city_id, window.service);
  });

  $('.controls-wrap .control').click(function(e){
    e.stopPropagation();
    e.preventDefault();
    $('.controls-wrap .control').removeClass('active');
    $(this).addClass('active');
    $('#info, .map-wrap').removeClass('animate');
    $('#message').hide();
    $(document).trigger('service:changed', [$(this).data('type')]);
  });

});