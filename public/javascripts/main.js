$(document).ready(function() {
  $('.delete-film').on('click', function(e) {
    $target = $(e.target);
    const id = $target.attr('data-id');
    $.ajax({
      type: 'DELETE',
      url: '/films/' + id,
      success: function(response) {
        alert('Deleting Film');
        window.location.href = '/films';
      },
      error: function(err) {
        console.log(err);
      }
    });
  });
  $('.btn-rating').on('click', function(e) {
    $target = $(e.target);
    let rating = $target.attr('rate');
    let id = $target.attr('filmid');
    data = {
      rating:rating,
      filmID:id
    }
    $.ajax({
      type: 'POST',
      url: '/films/rate',
      data:data,
      success: function(response) {
        $('.btn-rating').removeClass('btn-success');
        $target.addClass('btn-success');
      },
      error: function(err) {
        alert(err.responseJSON.error)
      }
    });
  });
  $('#btn-correlation').on('click', function(e) {
    $target = $(e.target);
    $target.attr('disabled', 'disabled');
    $.ajax({
      type: 'POST',
      url: '/recomendation/correlation',
      success: function(response) {
        console.log("correlation calculated!!");
      },
      error: function(err) {
        alert(err.statusText)
      }
    });
  });
  $('#btn-recomendation').on('click', function(e) {
    $target = $(e.target);
    $target.attr('disabled', 'disabled');
    $.ajax({
      type: 'POST',
      url: '/recomendation/calculate',
      success: function(response) {
        console.log("recomendation calculated!!");
      },
      error: function(err) {
        alert(err.statusText)
      }
    });
  });

  $(document).on('click','button.btn-add-actor', function(e) {
    target = $(e.target);
    console.log(target);
    target.attr('disabled', 'disabled');
    $('#actors').append('<div class="row"><div class="col-sm-5"><input class="form-control" placeholder="name" name="name" type="text"></div><div class="col-sm-1" align="center"><h4>as</h4></div><div class="entry input-group col-sm-6"><input class="form-control" placeholder="role" name="role" type="text"><span class="input-group-btn"><button class="btn btn-success btn-add-actor" type="button"><span>+</span></button></span></div><br></div>');
  });
  $(document).on('change','#year',function(e){
    target = $('#premiere')[0];
    if(!target.valueAsDate){
      target.value = $('#year')[0].value + '-01-01';
    }
  });
  $(document).on('change','input[type="text"]',function(e){
    $target = $(e.target)[0];
    $target.value = $target.value.trim();
  });

  $('#btn-filter').on('click', function(e){
    e.preventDefault();
    let title = $('#titlefilter')[0].value;
    let genre = $('#genrefilter')[0].value;
    let year = $('#yearfilter')[0].value;
    let country = $('#countryfilter')[0].value;

    let goto = "/films?";
    if(title!="") goto+="title="+title+"&";
    if(year!="") goto+="year="+year+"&";
    if(genre!="") goto+="genre="+genre+"&";
    if(country!="") goto+="country="+country+"&";

    let orderby = $('input[type=radio]:checked')[0].value;
    let order = $('#orderSelect')[0].value;
    goto += "orderby=" +(order=="Descending"?"-":"")+ orderby;

    window.location.replace(goto);
  });
  let searchParams = new URLSearchParams(window.location.search);
  if($('#titleRadio').length && searchParams.has('orderby')){
      let order = searchParams.get('orderby');
      $('#orderSelect').val(order.charAt(0)=='-'?'Descending':'Ascending');
      if(order.charAt(0)=='-') order = order.substr(1);
      $("#titleRadio").prop("checked", (order=='title'));
      $("#yearRadio").prop("checked", (order=='year'));
      $("#dateRadio").prop("checked", (order=='meta.added.date'));
  }

});
