function getTaxCode (str) {
	var n = str.indexOf('MST:');
	var taxCode = '';
	var taxCodeTmp = '';
	if (n < 0) {
		return '';
	}
	
	//var result = str.substring(n+4, str.length).trim();
	var result = $.trim( str.substring(n+4, str.length) );
	
	//case of other: "EMAILADDRESS=Brights@gmail.com, CN=CÃ´ng Ty TNHH Brights Việt Nam, O=MST:0312797207, L=Thành phố HCM, C=VN"
	//there is a commas then we get string before the commas
	if (result.indexOf(',') > 0) {
		taxCode = result.substring(0, result.indexOf(","));
	}
	//case of BKAV: "C=VN, ST=Hà  Nội, L=Cầu Giấy, CN=Công Ty TNHH Bkav Online_Test1, UID=MST:0106538422"
	//there is no commas so we get to the end of string
	else{
		taxCode = result;
	}
	if (taxCode.length == 13) {
		taxCode = taxCode.substring(0, 10) + '-' + taxCode.substring(10, 13);
	}
	return taxCode;
};

function dateFormat(date) {
    var yyyy = date.getFullYear().toString();                                    
    var mm = (date.getMonth()+1).toString(); // getMonth() is zero-based         
    var dd  = date.getDate().toString();             
                        
    return yyyy +(mm[1]?mm:"0" + mm[0]) + (dd[1]?dd:"0"+dd[0]);
};

// validTo co dinh dang "DD-MM-YYYY"
function dateFormatValidTo(validTo) {
	var str = validTo.split("-");
	return str[2] + str[1] + str[0];
};

function isExpired(toDate) {
	var result = false;
	toDate = dateFormatValidTo(toDate);
    /*
	$.ajax({
		type : 'GET',
		url : 'https://laphoadon.gdt.gov.vn/van-portal/registerTaxpayer/getDate',
		cache: false,
		dataType : 'json',
		async: false,
		success : function(today) {
			if (today > toDate) {
				result = true;
			}
		}
    });
    */
	return result;
};

function getCertificateName (str) {
	var n = str.indexOf('CN=');
	var name = '';
	if (n < 0) {
		return '';
	}
	
	var result = str.substring(n+3, str.length);
	if (result.indexOf(',') > 0) {
		name = result.substring(0, result.indexOf(","));
		return name;
	}
	return result;
};

function LoadCerts() {
    var html = "";
    var hasCert = false;
    var arrayCerts = document.activeX.GetCertArr();
    for (idx = 0; idx < arrayCerts.length; idx++) {
        var serialNumber = arrayCerts[idx].SerialNumber;
        var isExistedCertificate = false; //token da dang ky hay chua
        var isValidIssuer = true; //token co valid hay khong
        var isRevoked = false; //token co bi thu hoi khong

        var issuer = arrayCerts[idx].Issuer;
        var validFrom = arrayCerts[idx].ValidFrom;
        var validTo = arrayCerts[idx].ValidTo;
        var subject = arrayCerts[idx].Subject;
        var fullSubject = arrayCerts[idx].FullSubject.replace(/("|')/g, "");
        var certificateAlias = arrayCerts[idx].Alias;
        var status ='';
        var name = getCertificateName(fullSubject);
        var taxCode = getTaxCode(fullSubject);
        var certificateContent = arrayCerts[idx].CertificateContent;
        var certificateVersion = arrayCerts[idx].CertificateVersion;
        
        /* 
        //Check usb token da dang ky voi ivan hay chua
        $.ajax({
            type : 'GET',
            url : 'https://laphoadon.gdt.gov.vn/van-portal/registerTaxpayer/isExistedCertificate?serialNumber=' + serialNumber,
            cache: false,
            dataType : 'json',
            async: false,
            success : function(data) {
                if (data != null) {
                    isExistedCertificate = data;
                }
            }
        });
        //Check usb token co valid hay khong
        $.ajax({
            type : 'POST',
            url : 'https://laphoadon.gdt.gov.vn/van-portal/registerTaxpayer/isValidIssuer?certificateContent=' + certificateContent,
            cache: false,
            dataType : 'json',
            async: false,
            success : function(data) {
                if (data != null) {
                    isValidIssuer = data;
                }
            }
        });
        // Check usb token da bi thu hoi hay chua
        $.ajax({
            type : 'GET',
            url : 'https://laphoadon.gdt.gov.vn/van-portal/registerTaxpayer/isCertificateRevoked?serialNumber=' + serialNumber,
            cache: false,
            dataType : 'json',
            async: false,
            success : function(data) {
                if (data != null) {
                    isRevoked = data;
                }
            }
        });
        */
        html += "<tr>"
        if ((taxCode != null) && (taxCode.length > 0)) {
            if (isExpired(validTo)) {
                status = '<font style="color:red"> CTS hết hạn </font>';
                html += "<td></td>";
            } else {
                if (isExistedCertificate) {
                    status = '<font style="color:red"> CTS đã đăng ký </font>';
                    html += "<td></td>";
                } else {
                    if (!isValidIssuer) {
                        status = '<font style="color:red"> CTS không hợp lệ </font>';
                        html += "<td></td>";
                    } else {
                        if (isRevoked) {
                            status = '<font style="color:red"> CTS bị thu hồi </font>';
                            html += "<td></td>";
                        } else {
                            status = '<font style="color:blue"> CTS hợp lệ </font>';
                            html += "<td><input type='radio' name='radiotaxcode' serialNo='" + serialNumber + "' value='" + taxCode + "' onlclick='radioCheck(this)'/></td>";
                            hasCert = true;
                        }
                    }
                }
            }
        } else {
            html += "<td></td>";
            status = '<font style="color:red"> Không có MST </font>';
        }
        html += "<td>" + taxCode + "</td>";
        html += "<td style='text-align:left'>" + subject + "</td>";
        html += "<td style='text-align:left;'>" + serialNumber + "</td>";
        html += "<td>" + validFrom + "</td>";					
        html += "<td>" + validTo + "</td>";					
        html += "<td>" + status + "</td>";
        html += "</tr>";
        
        html += "<input type='hidden' name='certificateList[" + idx +"].toDate' value='" + validTo + "'/>";
        html += "<input type='hidden' name='certificateList[" + idx +"].fromDate' value='" + validFrom + "'/>";
        html += "<input type='hidden' id='serialNumber"+idx+"' name='certificateList[" + idx +"].serialNumber' value='" + serialNumber + "'/>";
        html += "<input type='hidden' name='certificateList[" + idx +"].subject' value='" + subject + "'/>";
        html += "<input type='hidden' name='certificateList[" + idx +"].fullSubject' value='" + fullSubject + "'/>";
        html += "<input type='hidden' name='certificateList[" + idx +"].taxCode' value='" + taxCode + "'/>";
        html += "<input type='hidden' name='certificateList[" + idx +"].issuer' value='" + issuer + "'/>";					
        html += "<input type='hidden' name='certificateList[" + idx +"].certificateContent' value='" + certificateContent + "'/>";
        html += "<input type='hidden' name='certificateList[" + idx +"].certificateAlias' value='" + certificateAlias + "'/>";
        html += "<input type='hidden' name='certificateList[" + idx +"].certificateVersion' value='" + certificateVersion + "'/>";	
    }
    
    $("#certificates-tbody").append(html);
    
    if (!hasCert){
        alert("Không tìm thấy Chứng thư số hợp lệ.\n\nVui lòng nhấn F5 hoặc Ctrl + F5 để đọc lại chứng thư số."); 
        return;
    } 
};

function appletDoException(_info) {
    alert(_info); 
}

function appletDebug(_info) {
    console.log(_info); 
}

function sendSignedToServer(pdfSignedBase64, pdfSignedBase64MD5, invoiceID, invoiceVersion, invoiceStatus, jwtToken) {
    var postData = {
        'InvoiceID' : invoiceID,
        'PDFBase64' : pdfSignedBase64,
        'PDFBase64MD5' : pdfSignedBase64MD5,
        'Status' : invoiceStatus,
        'Version' : invoiceVersion
    };

    $.ajax({
        url: '/api/einvoiceFiles',
        method: "POST",
        async: false,
        contentType: "application/json;charset=utf-8",
        dataType: "json", 
        data: JSON.stringify(postData),
        beforeSend: function (xhr) {   //Include the bearer token in header
            xhr.setRequestHeader("Authorization", jwtToken);
        }
    })
    .done(function() {
        alert( "POST einvoiceFile" );
    })
    .fail(function() {
        alert( "POST einvoiceFile error" );
    });
}