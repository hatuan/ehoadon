/* Menu Auto Dropdown when hover */
/* don't use */
/* use */
/*
.dropdown:hover .dropdown-menu {
    display: block;
    }
*/
/*
$('ul.nav li.dropdown').hover(function() {
    $(this).find('.dropdown-menu').stop(true, true).delay(200).fadeIn(500);
  }, function() {
    $(this).find('.dropdown-menu').stop(true, true).delay(200).fadeOut(500);
  }
);
*/

function base64ToArrayBuffer(base64) {
  var binary_string =  window.atob(base64);
  var len = binary_string.length;
  var bytes = new Uint8Array( len );
  for (var i = 0; i < len; i++)        {
      bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

function arrayBufferToBase64(buffer) {
  var binary = '';
  var len = buffer.length;
  for (var i = 0; i < len; i++) {
      binary += String.fromCharCode(buffer[i]);
  }
  return window.btoa( binary );
}