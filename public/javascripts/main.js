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
    const rating = $target.attr('rate');
    const id = $target.attr('filmid');
    $.ajax({
      type: 'POST',
      url: '/films/rate/' + id + '/' + rating,
      success: function(response) {
        $('.btn-rating').removeClass('btn-success');
        $target.addClass('btn-success');
      },
      error: function(err) {
        alert(err.statusText)
      }
    });
  });
  $('#btn-correlation').on('click', function(e) {
    $target = $(e.target);
    $target.attr('disabled', 'disabled');
    $.ajax({
      type: 'POST',
      url: '/recomendation/calculate',
      success: function(response) {
        console.log("correlation calculated!!");
      },
      error: function(err) {
        alert(err.statusText)
      }
    });
  });
});
