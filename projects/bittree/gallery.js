$( document ).ready(function readyJQuery() {
  var myFirebaseRef = new Firebase("https://bitaddressstorage.firebaseio.com/pictures");
  myFirebaseRef.orderByChild("time").limitToLast(25).on("child_added", function(snapshot) {
    var data = snapshot.val();
    $("#gallery").prepend(
      $('<div/>', {'class': 'col s12 m6'}).append(
        $('<div/>', {'class': 'card'}).append(
          $('<div/>', {'class': 'card-image'}).append(
            $('<a/>', {href: data.image}).append(
              $('<img/>', {src: data.image})
            )
          ).append(
            $('<span/>', {class: 'card-title', text: new Date(parseInt(data.time))})
          )
        )
      )
    );
  });
});