function draw(city_id,service){
  destroy_polygons();
  $('#query').typeahead('destroy').val('');
  $.ajax({
    url:'http://10.1.8.18:8888/',
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

function addPolygon(obj,locality_id){
  polygon = obj['encoded_polygon'];
  decodePolygonMK2(locality_id, polygon,obj['color'],obj['apartment_type_data'], obj['price_data'],obj['locality_name'],obj['ratio'],obj['status'],obj['lat'], obj['lon']).setMap(window.map);
}

decodePolygonMK2 = function(locality_id, t,c,apartment_type_data, price_data, locality_name,ratio,status, lat, lng) {
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
  fillOpacity: 0.7,
  });
  // google.maps.event.addListener(poly, 'click', function(event) {
  //   window.polygon = poly;
  //   latlng = event.latLng;
  //   html = '';
  //   apartment_type_data_obj = null;
  //   price_data_obj = null;
  //   $(document).trigger('locality:changed', [locality_id, locality_name]);
  //   marker.setOptions({map : map, position : latlng});
  //   $('#info .locality-name').text(locality_name);
  //   if(apartment_type_data)
  //     apartment_type_data_obj = $.parseJSON(apartment_type_data);
  //   if(price_data)
  //     price_data_obj = $.parseJSON(price_data);
  //   $('#info .message').removeClass('alert');
  //   if(apartment_type_data_obj){
  //       $('#info .apartment_type_info, #info .price_info').html('');
  //       makeTree(apartment_type_data_obj);
  //       $('#info .info-content').find('.apartment_type_info').html(html);
  //       html='';
  //       if(price_data_obj)
  //         makeTree(price_data_obj);
  //       $('#info .info-content').find('.price_info').html(html);
  //       if(ratio < 0.8)
  //         $('#message').text('Traffic Required').addClass('alert');
  //       else if(ratio > 1.25)
  //         $('#message').text('Inventory Required').addClass('alert');
  //       else
  //         $('#message').text('Awesome!').removeClass('alert');
  //   }
  //   else{
  //     $('#message').text('Sorry, no inventory found!').addClass('alert');
  //     $('#info .info-content').find('.apartment_type_info').html('<div class="message">Sorry, no inventory found!</div>');
  //     $('#info .info-content').find('.price_info').html('<div class="message">Sorry, no inventory found!</div>');
  //   }
  //   $('#info, .map-wrap').addClass('animate');
  //   $('#message').show();
  // });

  google.maps.event.addListener(poly, 'mouseover', function(event) {
  apartment_type_data_obj = $.parseJSON(apartment_type_data);
    if(ratio < 0.8)
      message = 'Traffic Required';
    else if(ratio > 1.25)
      message = 'Inventory Required';
    else
      message = 'Awesome!';
    this.setOptions({fillOpacity : 1.0,  strokeColor: '#A0A0A0', strokeWeight:2});
    tooltip_html = '<div class="tt-header">'+locality_name+'</div><div class="tt-content">';
    tooltip_html = tooltip_html + '<div class="tt-message">'+message+'</div>';
    if(apartment_type_data_obj!=null){
      tooltip_html = tooltip_html + '<div class="tt-inventory"><span class="key">Total Inventory </span><span class="value">'+apartment_type_data_obj["inventory"]+'</span></div>';
      if(apartment_type_data_obj["req.inventory"]!=null)
        tooltip_html = tooltip_html + '<div class="tt-demand"><span class="key">Required Inventory </span><span class="value">'+apartment_type_data_obj["req.inventory"]+'</span></div>';
    }
    else{
      tooltip_html = tooltip_html + '<div class="tt-inventory"><span class="key">Total Inventory </span><span class="value">'+0+'</span></div>';
      tooltip_html = tooltip_html + '<div class="tt-demand"><span class="key">Required Inventory </span><span class="value">'+0+'</span></div>';
    }
    tooltip_html = tooltip_html + '</div>';
    tooltip.show(tooltip_html);
  });
  google.maps.event.addListener(poly, 'mouseout', function(event){
    tooltip.hide();
    this.setOptions({fillOpacity : 0.7, strokeWeight:1});
  });
  poly['lat'] = lat;
  poly['lng'] = lng;
  polygon_arr.push(poly)
  return poly;
}

function makeTree(obj){
  keys = Object.keys(obj);
  if(keys.length !=0){
    $(keys).each(function(i, key){
      if(key!='Total'){
        if(typeof obj[key] === 'object'){
          // $('<ul/>').addClass('has-children')
          // .append($('<li/>').append('<h4/>').addClass('list-header').text(key).append(makeTree(obj[key])));
          expand_class = '';
          if(obj[key]['inventory']!=null || obj[key]['req.inventory']!=null)
            expand_class = 'un_expandable';
          html = html + '<ul class="has-children '+expand_class+'">';
          html = html + '<li> <h4 class="list-header">'+key;
          if(obj[key]['Total']!=null){
            inv = obj[key]['Total']['inventory'];
            dem = obj[key]['Total']['req.inventory'];
            tmp_class='';
            if(inv < dem)
              tmp_class="alert";
            html = html + '<span class="inv-dem-ratio '+tmp_class+'" data-inv="'+inv+'" data-dem="'+dem+'">'+inv+' / '+dem+'</span>';
          }
          if(obj[key]['inventory']!=null || obj[key]['req.inventory']!=null){
            inv = obj[key]['inventory'];
            dem = obj[key]['req.inventory'];
            tmp_class='';
            if(inv < dem)
              tmp_class="alert";
            html = html + '<span class="inv-dem-ratio '+tmp_class+'">'+inv+' / '+dem+'</span>';
          }
          html = html+'</h4>';
          makeTree(obj[key]);
          html = html + '</li></ul>';
        }
        else{
          // $('<ul/>').addClass('is-child')
          // .append($('<li/>').append('<span/>').addClass('label').text(key).append('<span/>').addClass('value').text(obj[key]));
          // html = html + '<ul class="is-child '+key+'" data-value="'+obj[key]+'">';
          // html = html + '<li> <span class="label">'+ key +'</span><span class="value">'+obj[key] +'</span></li></ul>';
          return;
        }
      }
    });
  }
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
    marker.setMap(null);
    draw(window.city_id, window.service);
  });

  $(document).on('locality:changed', function(e, locality_id, locality_name){
    window.locality_id = locality_id;
    window.locality_name =locality_name;
    $('#query').val(locality_name);
  });

  $(document).on('service:changed', function(e, service){
    window.service = service;
    update_csv_link_url();
    map.setOptions({center:new google.maps.LatLng(lat[window.city_id],lon[window.city_id]), zoom:11});
    marker.setMap(null);
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
});