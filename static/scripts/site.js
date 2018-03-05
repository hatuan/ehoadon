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
    var binary_string = window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
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
    return window.btoa(binary);
}

//Convert a number into words
function NumberToWords(_number) {
    var words_of_number = {
        "99": "chín mươi chín",
        "98": "chín mươi tám",
        "97": "chín mươi bảy",
        "96": "chín mươi sáu",
        "95": "chín mươi lăm",
        "94": "chín mươi tư",
        "93": "chín mươi ba",
        "92": "chín mươi hai",
        "91": "chín mươi mốt",
        "90": "chín mươi",
        "89": "tám mươi chín",
        "88": "tám mươi tám",
        "87": "tám mươi bảy",
        "86": "tám mươi sáu",
        "85": "tám mươi lăm",
        "84": "tám mươi tư",
        "83": "tám mươi ba",
        "82": "tám mươi hai",
        "81": "tám mươi mốt",
        "80": "tám mươi",
        "79": "bảy mươi chín",
        "78": "bảy mươi tám",
        "77": "bảy mươi bảy",
        "76": "bảy mươi sáu",
        "75": "bảy mươi lăm",
        "74": "bảy mươi tư",
        "73": "bảy mươi ba",
        "72": "bảy mươi hai",
        "71": "bảy mươi mốt",
        "70": "bảy mươi",
        "69": "sáu mươi chín",
        "68": "sáu mươi tám",
        "67": "sáu mươi bảy",
        "66": "sáu mươi sáu",
        "65": "sáu mươi lăm",
        "64": "sáu mươi tư",
        "63": "sáu mươi ba",
        "62": "sáu mươi hai",
        "61": "sáu mươi mốt",
        "60": "sáu mươi",
        "59": "năm mươi chín",
        "58": "năm mươi tám",
        "57": "năm mươi bảy",
        "56": "năm mươi sáu",
        "55": "năm mươi lăm",
        "54": "năm mươi tư",
        "53": "năm mươi ba",
        "52": "năm mươi hai",
        "51": "năm mươi mốt",
        "50": "năm mươi",
        "49": "bốn mươi chín",
        "48": "bốn mươi tám",
        "47": "bốn mươi bảy",
        "46": "bốn mươi sáu",
        "45": "bốn mươi lăm",
        "44": "bốn mươi tư",
        "43": "bốn mươi ba",
        "42": "bốn mươi hai",
        "41": "bốn mươi mốt",
        "40": "bốn mươi",
        "39": "ba mươi chín",
        "38": "ba mươi tám",
        "37": "ba mươi bảy",
        "36": "ba mươi sáu",
        "35": "ba mươi lăm",
        "34": "ba mươi tư",
        "33": "ba mươi ba",
        "32": "ba mươi hai",
        "31": "ba mươi mốt",
        "30": "ba mươi",
        "29": "hai mươi chín",
        "28": "hai mươi tám",
        "27": "hai mươi bảy",
        "26": "hai mươi sáu",
        "25": "hai mươi lăm",
        "24": "hai mươi tư",
        "23": "hai mươi ba",
        "22": "hai mươi hai",
        "21": "hai mươi mốt",
        "20": "hai mươi",
        "19": "mười chín",
        "18": "mười tám",
        "17": "mười bảy",
        "16": "mười sáu",
        "15": "mười lăm",
        "14": "mười tư",
        "13": "mười ba",
        "12": "mười hai",
        "11": "mười một",
        "10": "mười",
        "09": "lẻ chín",
        "08": "lẻ tám",
        "07": "lẻ bảy",
        "06": "lẻ sáu",
        "05": "lẻ năm",
        "04": "lẻ tư",
        "03": "lẻ ba",
        "02": "lẻ hai",
        "01": "lẻ một",
        "00": "",
        "00_remove": "không trăm lẻ",
        "9": "chín",
        "8": "tám",
        "7": "bảy",
        "6": "sáu",
        "5": "năm",
        "4": "tư",
        "3": "ba",
        "2": "hai",
        "1": "một",
        "0": "không",
        "000": "",
        "100": "trăm",
        "1000": "ngàn",
        "1000000": "triệu",
        "1000000000": "tỷ",
        "minus": "Âm",
    };

    //Converts a number from 100-999 into words
    function GetHundreds(s) {
        if(parseInt(s, 10)==NaN || parseInt(s, 10)===0) {
            return words_of_number["000"]
        }
        var _return = words_of_number[s.substring(0, 1)] + ' ' + words_of_number["100"] + ' ';
        return _return + words_of_number[s.substring(1)]
    };

    var _result = '';
    var Temp = '';
    var Billion = 1000000000;
    var Million = 1000000;
    var Thousand = 1000;
    var Hundred = 100;
    var MaxNumber = 1000000000000000;
    if(_number < 0) {
        _result = words_of_number["minus"];
    }
    _number = Math.abs(_number);

    if(_number > MaxNumber) {
        return "*****************";
    }
    var _removeLeftStr = words_of_number["00_remove"];
    var MyNumber = "" + _number;
    var Count = 1;
    var unitNames = ['', 
        ' ' + words_of_number["1000"] + ' ',  
        ' ' + words_of_number["1000000"] + ' ', 
        ' ' + words_of_number["1000000000"] + ' ',
        ' ' + words_of_number["1000"] + ' ',
        ' ' + words_of_number["1000000"] + ' '];
    
    while(MyNumber != '') {
        Temp = GetHundreds(('000' + MyNumber).substring(('000' + MyNumber).length - 3));
        if(Temp != '')
            _result = Temp + unitNames[Count - 1] + _result;
        else if (Count == 4)
            _result = unitNames[Count - 1].trim() + ' ' + _result;
        
        if(MyNumber.length > 3) 
            MyNumber = MyNumber.substring(0, MyNumber.length - 3);
        else
            MyNumber = '';
        Count++;
    }

    if(_result.substring(0, _removeLeftStr.length) == _removeLeftStr) 
        _result = _result.substring(_removeLeftStr.length);
    
    return _result.trim();
}