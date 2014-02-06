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
var locality_id = null;
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

function addPolygon(obj,locality_id){
    polygon = obj['encoded_polygon'];
    decodePolygonMK2(locality_id, polygon,obj['color'],obj['apartment_type_data'], obj['price_data'],obj['locality_name'],obj['ratio'],obj['status'],obj['lat'], obj['lon']).setMap(window.map);
}

var styles= [

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
decodePolygonMK2 = function(locality_id, t,c,apartment_type_data, price_data, locality,ratio,status, lat, lng) {
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
    google.maps.event.addListener(poly, 'click', function(event) {
      window.polygon = poly;
      latlng = event.latLng;
      html = '';
      window.locality_id = locality_id;
      window.marker.setPosition(latlng);
      $('#info .locality-name').text(locality);
      apartment_type_data_obj = $.parseJSON(apartment_type_data);
      price_data_obj = $.parseJSON(price_data);
      $('#info .message').removeClass('alert');
      // this.setOptions({fillOpacity : 0.7, strokeWeight:0});
      if(apartment_type_data_obj){
          $('#info .apartment_type_info, #info .price_info').html('');
          makeTree(apartment_type_data_obj);
          $('#info .info-content').find('.apartment_type_info').html(html);
          html='';
          makeTree(price_data_obj);
          $('#info .info-content').find('.price_info').html(html);
          // showAlerts();
          if(ratio < 0.8)
            $('#message').text('Traffic Required').addClass('alert');
          else if(ratio > 1.25)
            $('#message').text('Inventory Required').addClass('alert');
          else
            $('#message').text('Awesome!').removeClass('alert');
      }
      else{
        $('#message').text('Sorry, no inventory found!').addClass('alert');
        $('#info .info-content').find('.apartment_type_info').html('<div class="message">Sorry, no inventory found!</div>');
        $('#info .info-content').find('.price_info').html('<div class="message">Sorry, no inventory found!</div>');
      }
      $('#info, .map-wrap').addClass('animate');
      $('#message').show();
      // $('#info').html('locality: '+locality+'<br>data: '+data+'<br>ratio: '+ratio+'<br>status: '+status)
    });
    google.maps.event.addListener(poly, 'mouseover', function(event) {
    //       $('#info .locality-name').text(locality);
    //       data_obj = $.parseJSON(data);
    // debugger;
    apartment_type_data_obj = $.parseJSON(apartment_type_data);
    // console.log(apartment_type_data_obj)
      if(ratio < 0.8)
        message = 'Traffic Required';
      else if(ratio > 1.25)
        message = 'Inventory Required';
      else
        message = 'Awesome!';
      this.setOptions({fillOpacity : 1.0,  strokeColor: '#A0A0A0', strokeWeight:2});
      tooltip_html = '<div class="tt-header">'+locality+'</div><div class="tt-content">';
      tooltip_html = tooltip_html + '<div class="tt-message">'+message+'</div>';
      if(apartment_type_data_obj!=null){
        tooltip_html = tooltip_html + '<div class="tt-inventory"><span class="key">Total Inventory </span><span class="value">'+apartment_type_data_obj["inventory"]+'</span></div>';
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
          // debugger;
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
function showAlerts(){
    $('.is-child.invent').each(function(i, el){
      inv = $(this).data('value');
      dem = $(this).siblings('.demand').data('value');
      if(dem > inv)
        $(this).closest('.has-children').addClass('alert');
    });
}
function draw(city_id,service){
  $.ajax({
    url:'http://analytics.housing.com/heatmap.php',
    type:'get',
    data:  {city:city_id, type: service}
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
        // tmp['value'] = JSON.stringify(lat_lng);
        typeahead_data.push(tmp);
        addPolygon(obj,key)
    });
    $(document).trigger('data:fetched')
  });
}
function initialize() {
    // city_name = $( ".city-menu .city.active").data('value');
    update_csv_link_url();
    var mapOptions = {
      zoom: 11,
      panControl: false,
      zoomControl: false,
      mapTypeControl: false,
      scaleControl: false,
      streetViewControl: false,
      overviewMapControl: false,
      center: new google.maps.LatLng(lat[window.city_id],lon[window.city_id]),
      mapTypeControlOptions: {
        style: styles
      }
    };
    map = new google.maps.Map(document.getElementById('map-canvas'),
        mapOptions);
    map.setOptions({styles: styles});
    draw(window.city_id, window.service);
    window.marker = new google.maps.Marker({
        position: new google.maps.LatLng(0,0),
        map: map
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
  $(document).on('data:fetched', function(){
    $('#query').typeahead({
      name: unique++,
      valueKey: 'locality_name',
      local: typeahead_data
    });
    $('#query').on('typeahead:selected', function (object, datum) {
      // Example: {type: "typeahead:selected", timeStamp: 1377890016108, jQuery203017338529066182673: true, isTrigger: 3, namespace: ""...}
      poly = $(polygon_arr).filter(function(i,n){
        if(n.lat == datum.lat && n.lng == datum.lng)
          return true;
        else
          return false;
      });
      google.maps.event.trigger(poly[0], 'click', {latLng:new google.maps.LatLng(datum.lat,datum.lng)});
      // poly[0].setOptions({fillOpacity : 1.0,  strokeColor: '#A0A0A0', strokeWeight:4});
  });
  });
  
  
});
