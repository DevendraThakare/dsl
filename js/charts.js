var furnish_type_arr = [{'key':'1', 'value':'Fully Furnished'}, {'key':'2','value':'Semi Furnished'}, {'key':'3', 'value':'Unfurnished'}];
// var apart_type_arr = [{'key':'1', 'value':'1 RK'}, {'key':'2', 'value':'1 BHK'}, {'key':'3', 'value':'1.5 BHK'}, 
// {'key':'4', 'value':'2 BHK'}, {'key':'5', 'value':'2.5 BHK'}, {'key':'6', 'value':'3 BHK'}, 
// {'key':'7', 'value':'4 BHK'}, {'key':'8', 'value':'5 BHK'}, {'key':'9', 'value':'5+ BHK'}, 
// {'key':'10', 'value':'2 RK'}, {'key':'11', 'value':'3 RK'}, {'key':'12', 'value':'1R'},
// {'key':'13', 'value':'4.5 BHK'}, {'key':'14', 'value':'3.5 BHK'}, {'key':'15', 'value':'2R'}];
var owner_type_arr = [{'key':'1', 'value':'Broker'}, {'key':'2', 'value':'Landlord'}];
var apart_type_arr = [{'key':'1', 'value':'1RK'}, {'key':'2', 'value':'1BHK'}, {'key':'3', 'value':'2BHK'}, 
{'key':'4', 'value':'3BHK'}, {'key':'5', 'value':'3+BHK'}]
var filters = [];
var multiselect_filter_template = '<div class="filter_ele"><label><input name="<%= name %>" type="checkbox" value="<%= obj.key %>"><span><%= obj.value%></span></label></div>';
var singleselect_filter_template = '<div class="filter_ele"><label><input type="radio" name="<%= name %>" value="<%= obj.key %>"><span><%= obj.value%></span></label></div>';

google.load("visualization", "1", {packages:["corechart"]});

function drawChart(data,type) {
  var options={}, chart;
  switch(type){
    case 'inventory' : 
      options = {
        title: 'Demand Supply Graph for '+window.locality_name
      };
      chart = new google.visualization.LineChart(document.getElementById('inv-chart'));
      break;

    case 'listing_requests' : 
      options = {
        title: 'Listings Requests Graph for '+window.locality_name
      };
      chart = new google.visualization.LineChart(document.getElementById('listing-requests-chart'));
      break;
  }
  chart.draw(data, options);
}

function get_data_table(obj, type){
  var data = new google.visualization.DataTable();
  switch(type){
    case 'inventory' : 
      data.addColumn('string', 'Task');
      data.addColumn('number', 'Avail. Inventory');
      data.addColumn('number', 'Req. Inventory');
      _.each(obj, function(el,i){
        data.addRow([i, parseInt(el.avail_inv), parseInt(el.req_inv)]);
      });
      break;

    case 'listing_requests' : 
      data.addColumn('string', 'Task');
      data.addColumn('number', 'Listing Requests');
      _.each(obj, function(el,i){
        data.addRow([i, parseInt(el.lr)]);
      });
      break;
  }
  
  return data
}

function get_multiselect_filter(obj, name){
  var html = '';
  _.each(obj, function(el){
    html = html+_.template(multiselect_filter_template, {name:name, obj:el});
  });
  return html;
}

function get_singleselect_filter(obj, name){
  var html = '';
  _.each(obj, function(el){
    html = html+_.template(singleselect_filter_template, {name:name, obj:el});
  });
  return html;
}
hide_graph = function(e){
  if(e.which == 27)
    $('.charts-wraper').removeClass('visible');
}

function showCharts(){
  $('.inv-chart-filter, .listing-requests-chart-filter').html('');
  $('.charts-wraper').removeClass('loading');
  $('.inv-chart-filter').html(get_multiselect_filter(apart_type_arr, 'appartment_type'));
  $('.listing-requests-chart-filter').html(get_multiselect_filter(owner_type_arr, 'owner_type'));
  $.when($.ajax({
    url:'http://analytics.housing.com/locality_invent.php',
    type:'get',
    data:  {lid:locality_id, cat: service}
  }),
    $.ajax({
    url:'http://analytics.housing.com/locality_listing_requests.php',
    type:'get',
    data:  {lid:locality_id}
  }))
  .done(function(invent_data, list_req_data) { 
    invent_data_obj = JSON.parse(invent_data[0]);
    list_req_data_obj = JSON.parse(list_req_data[0]);
    drawChart(get_data_table(invent_data_obj, 'inventory'), 'inventory');
    drawChart(get_data_table(list_req_data_obj, 'listing_requests'), 'listing_requests');
    $('.charts-wraper').removeClass('loading');
  });

  // $.ajax({
  //   url:'http://analytics.housing.com/locality_listing_requests.php',
  //   type:'get',
  //   data:  {lid:locality_id}
  // })
  // .done(function(data){
  //   console.log(data);
  // });

  // $.ajax({
  //   url:'http://analytics.housing.com/locality_invent.php',
  //   type:'get',
  //   data:  {lid:locality_id, cat: service}
  // })
  // .done(function(data){
  //   console.log(data);
  // });
}

$(document).ready(function(){
  // response=[{'01/01/2014': {'avail_inv':1000, 'req_inv':400}},{'08/01/2014' : {'avail_inv':1170, 'req_inv':  460}},
  // {'15/01/2014' : {'avail_inv':660,  'req_inv':  1120}},{'22/01/2014' : {'avail_inv':1030, 'req_inv':  540}},
  // {'29/01/2014' : {'avail_inv':1030, 'req_inv':  540}},{'06/02/2014' : {'avail_inv':670,  'req_inv': 900}},
  // {'14/02/2014' : {'avail_inv':740,  'req_inv':  990}},{'21/02/2014' : {'avail_inv':550,  'req_inv': 870}},
  // {'28/02/2014' : {'avail_inv':1120, 'req_inv':   920}}];
  
  $('.show-charts').click(function(e){
    showCharts();
    $('.charts-wraper').addClass('visible');
    $(document).on('keyup', hide_graph);
  });
  $('.close-charts').click(function(e){
    $('.charts-wraper').removeClass('visible');
    $(document).off('keyup', hide_graph);
  });
});