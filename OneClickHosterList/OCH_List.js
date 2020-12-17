// ==UserScript==
// @exclude     *
// ==UserLibrary==
// @name        OCH List
// @description A list of One-Click-Hosters that are supported by nopremium.pl
// @version     30
// @license     GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// ==/UserLibrary==
// @namespace   cuzi
// @homepageURL https://github.com/cvzi/Userscripts
// @grant       GM_xmlhttpRequest
// @grant       GM.xmlhttpRequest
// @require     http://openuserjs.org/src/libs/cuzi/RequestQueue.js
// ==/UserScript==

"use strict";

/*

var rq = new RequestQueue();
var MAXDOWNLOADSIZE = 2048; // KB
*/

function getOCH(rq, MAXDOWNLOADSIZE) {

if(!rq) {
  rq = {"add" : function() {console.log("OCH List: Error: No RequestQueue() parameter set")}}
}
if(!MAXDOWNLOADSIZE) {
  MAXDOWNLOADSIZE = 2048
}


var OCH_permanentlyoffline = function(link,cb,thisArg) {
  cb.call(thisArg,link,0); // Offline
}

var OCH_unkown = function(link,cb,thisArg) {
  cb.call(thisArg,link,-1,"This hoster cannot be checked");
}

var OCH_ByFindingString = function(link,s,cb,thisArg,useURL) {
  // Offline if one of the strings [s] is found in the responseText
  if(typeof s == "string") {
    s = [s];
  }
  rq.add({
    method: "GET",
    url: useURL?useURL:link.url,
    onprogress: function(response) {
      // abort download of big files
      if((Math.max(response.loaded,response.total)/1024) > MAXDOWNLOADSIZE) {
        this.__result.abort();
        cb.call(thisArg,link,1); // Let's assume big files are online
      }
    },
    onload: function (response){
      for(var i = 0; i < s.length; i++) {
        if(response.responseText.indexOf(s[i]) != -1) {
          cb.call(thisArg,link,0); // Offline
          return;
        }
      }
      cb.call(thisArg,link,1); // Online
    },
    onerror: function (response){
      cb.call(thisArg,link,0); // Offline
    }
  });
}
var OCH_ByNotFindingString = function(link,s,cb,thisArg,useURL) {
  // Offline if none of the strings [s] is found in the responseText
  if(typeof s == "string") {
    s = [s];
  }
  rq.add({
    method: "GET",
    url: useURL?useURL:link.url,
    onprogress: function(response) {
      // abort download of big files
      if((Math.max(response.loaded,response.total)/1024) > MAXDOWNLOADSIZE) {
        this.__result.abort();
        cb.call(thisArg,link,1); // Let's assume big files are online
      }
    },
    onload: function (response){
      for(var i = 0; i < s.length; i++) {
        if(response.responseText.indexOf(s[i]) != -1) {
          cb.call(thisArg,link,1); // Online
          return;
        }
      }
      cb.call(thisArg,link,0); // Offline
    },
    onerror: function (response){
      cb.call(thisArg,link,0); // Offline
    }
  });
}
var OCH_ByMatchingFinalUrl = function(link,re,cb,thisArg,useURL) {
  // Offline if one of the RegEx [re] matches the finalUrl
  if(!Array.isArray(re)) {
    re = [re];
  }

  rq.add({
    method: "GET",
    url: useURL?useURL:link.url,
    onprogress: function(response) {
      // abort download of big files
      if((Math.max(response.loaded,response.total)/1024) > MAXDOWNLOADSIZE) {
        this.__result.abort();
        cb.call(thisArg,link,1); // Let's assume big files are online
      }
    },
    onload: function (response){
      for(var i = 0; i < re.length; i++) {
        if(re[i].test(response.finalUrl)) {
          // Link is offline
          cb.call(thisArg,link,0);
          return;
        }
      }
      cb.call(thisArg,link,1); // Online
    },
    onerror: function (response){
      cb.call(thisArg,link,0); // Offline
    }
  });
}

return {

/*

pattern: A single RegExp or an array of RegExp
multi: An array of multihost-services that support this hoster
title: String
homepage: String/URL
check: void check(link, cb, thisArg)
  link : { url: "http://example.com/example.file", [...]  }
  cb : void thisArg.cb(link, result, errorstring)
       link : the original link object
       result: 1 -> online, 0 -> offline, -1 -> error
       errorstring: may contain error details e.g. the request result, only set if result == -1
  thisArg : The value of this provided for the call to cb.
*/

'180upload' : {
  'pattern' : /^http:\/\/180upload\.com\/\w+$/m,
  'multi' : [],
  'title' : 'Offline: 180upload',
  'homepage' : 'http://180upload.com/',
  'check' : function(link,cb,thisArg) {
    OCH_permanentlyoffline(link, cb, thisArg);
  }
},
'1fichier' : {
  'pattern' : [/^https?:\/\/(www\.)?1fichier\.com\/.+$/m, /^https?:\/\/\w+\.1fichier\.com\/?.*$/m],
  'multi' : ['nopremium.pl', 'premiumize.me'],
  'title' : '1fichier',
  'homepage' : 'http://1fichier.com/',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link,["The requested file could not be found","The requested file has been deleted"], cb, thisArg);
  }
},
'2shared' : {
  'pattern' : /^https?:\/\/www\.2shared\.com\/[a-z]+\/\w+\/?(.+\.html)?$/,
  'multi' : [],
  'title' : '2Shared',
  'homepage' : 'http://www.2shared.com/',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link,"VGhlIGZpbGUgbGluayB0aGF0IHlvdSByZXF1ZXN0ZWQgaXMgbm90IHZhbGlkLiBQbGVhc2UgY29udGFjdCBsaW5rIHB1Ymxpc2hlciBvciB0cnkgdG8gbWFrZSBhIHNlYXJjaC4=", cb, thisArg);
  }
},
'4shared' : {
  'pattern' : /^https?:\/\/www\.4shared\.com\/[a-z]+\/\w+\/?(.+\.html)?$/,
  'multi' : ['nopremium.pl'],
  'title' : '4shared.com',
  'homepage' : 'http://www.4shared.com/',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link,[" is not valid"," is unavailable"," was deleted"], cb, thisArg);
  }
},
'4downfiles' : {
  'pattern' :/^https?:\/\/4downfiles?\.com?\/\w+\/?(.+\.html)?$/m,
  'multi' : [],
  'title' : '4 Down Files',
  'homepage' : 'http://4downfiles.co/',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link, "File Not Found", cb, thisArg);
  },
},
'alfafile' : {
  'pattern' : /^https?:\/\/(www\.)?alfafile\.net\/file\/.+$/m,
  'multi' : ['nopremium.pl'],
  'title' : 'Alfafile',
  'homepage' : 'https://alfafile.net',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link, "error-box", cb, thisArg);
  },
},
'anonfiles' : {
  'pattern' : /^https?:\/\/anonfiles\.com\/\w+\/?.*$/m,
  'multi' : ['nopremium.pl'],
  'title' : 'anonfiles',
  'homepage' : 'https://anonfiles.com',
  'check' : function(link,cb,thisArg) {
    rq.add({
      method: "GET",
      url: "https://api.anonfiles.com/v2/file/" + encodeURIComponent(link.url.match(/\/\/anonfiles\.com\/(\w+)/)[1]) + "/info",
      onload: function (response){
        var result = JSON.parse(response.responseText);
        if(result && result.status) {
          // Link is online
          cb.call(thisArg,link,1);
        } else {
          // Link is offline
          cb.call(thisArg,link,0);
        }
      },
      onerror: function (response){
        cb.call(thisArg,link,0); // Offline
      }
    });
  }
},
'ayefiles' : {
  'pattern' : /^https?:\/\/ayefiles\.com\/\w+\/?.*$/m,
  'multi' : [],
  'title' : 'AyeFiles',
  'homepage' : 'https://ayefiles.com/',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link, "File Not Found", cb, thisArg);
  },
},
'bayfiles' : {
  'pattern' : /^https?:\/\/(www\.)?bayfiles\.(net|com)\/\w+\/?.*$/m,
  'multi' : ['nopremium.pl'],
  'title' : 'BayFiles',
  'homepage' : 'http://bayfiles.com/',
  'check' : function(link,cb,thisArg) {
    rq.add({
      method: "GET",
      url: "https://api.bayfiles.com/v2/file/" + encodeURIComponent(link.url.match(/bayfiles\.(net|com)\/(\w+)/)[2]) + "/info",
      onload: function (response){
        var result = JSON.parse(response.responseText);
        if(result && result.status) {
          // Link is online
          cb.call(thisArg,link,1);
        } else {
          // Link is offline
          cb.call(thisArg,link,0);
        }
      },
      onerror: function (response){
        cb.call(thisArg,link,0); // Offline
      }
    });
  }
},
'bigfile' : {
  'pattern' : /^https?:\/\/(www\.)?bigfile\.to\/file\/.+\/?.*$/m,
  'multi' : [],
  'title' : 'BigFile',
  'homepage' : 'https://www.bigfile.to/',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link,["errorBox", "error-box"], cb, thisArg);
  },
},
'billionuploads' : {
  'pattern' : /^http:\/\/billionuploads\.com\/\w+$/m,
  'multi' : ['nopremium.pl'],
  'title' : 'Offline: Billion Uploads',
  'homepage' : 'http://billionuploads.com/',
  'check' : function(link,cb,thisArg) {
    OCH_permanentlyoffline(link, cb, thisArg);
  }
},
'bitshare' : {
  'pattern' : /^http:\/\/bitshare\.com\/files\/\w+\/.+\.html$/m,
  'multi' : [],
  'title' : 'BitShare.com',
  'homepage' : 'http://bitshare.com/',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link,["Error - File not available","Fehler - Datei nicht verfügbar"], cb, thisArg);
  },
},
'catshare' : {
  'pattern' : /^https?:\/\/(www\.)?catshare\.net\/.+$/m,
  'multi' : ['nopremium.pl'],
  'title' : 'CatShare',
  'homepage' : 'http://catshare.net/',
  'check' :function(link,cb,thisArg) {
    OCH_ByFindingString(link,"Podany plik został usunięty", cb, thisArg);
  },
},
'clicknupload' : {
  'pattern' : /^https?:\/\/(www\.)?clicknupload\.(link|org|co)\/\w+\/?.*$/m,
  'multi' : ['nopremium.pl', 'premiumize.me'],
  'title' : 'ClicknUpload',
  'homepage' : 'https://clicknupload.co',
  'check' :function(link,cb,thisArg) {
    OCH_ByFindingString(link,["File Not Found", "Error</td>"], cb, thisArg);
  },
},
'cloudyfiles' : {
  'pattern' : [/^https?:\/\/cloudyfiles\.(me|com|org)\/\w+.*$/m, /^https?:\/\/businessnewsstories\.online\/\w+.*$/m],
  'multi' : [],
  'title' : 'Offline: Cloudyfiles.org',
  'homepage' : 'http://cloudyfiles.org/',
  'check' :function(link,cb,thisArg) {
    OCH_permanentlyoffline(link, cb, thisArg);
  },
},
'cwtv' : {
  'pattern' : /^https?:\/\/www\.cwtv\.com\/cw-video\/.+$/m,
  'multi' : [],
  'title' : 'CW Television Shows',
  'homepage' : 'http://www.cwtv.com/',
  'check' : function(link,cb,thisArg) {
    OCH_ByMatchingFinalUrl(link,/\/cw-video\/$/, cb, thisArg);
  },
},
'dailymotion' : {
  'pattern' : /^https?:\/\/www\.dailymotion\.com\/video\/\w+.*$/m,
  'multi' : [],
  'title' : 'Dailymotion',
  'homepage' : 'http://www.dailymotion.com/',
  'check' :function(link,cb,thisArg) {
    OCH_ByFindingString(link,"You will be redirected to the homepage", cb, thisArg);
  },
},
'dailyuploads' : {
  'pattern' : /^https?:\/\/dailyuploads\.net\/\w+\/?.*$/m,
  'multi' : ['nopremium.pl'],
  'title' : 'Daily Uploads',
  'homepage' : 'http://dailyuploads.net/',
  'check' :function(link,cb,thisArg) {
    OCH_ByFindingString(link,["File Not Found", "file was removed"], cb, thisArg);
  },
},
'datafile' : {
  'pattern' : /^http:\/\/www\.datafile\.com\/d\/\w+.*$/m,
  'multi' : [],
  'title' : 'DataFile.com',
  'homepage' : 'http://www.datafile.com/',
  'check' :function(link,cb,thisArg) {
    OCH_ByFindingString(link,"ErrorCode", cb, thisArg);
  },
},
'datei' : {
  'pattern' : /^https?:\/\/(www\.)?datei\.to\/\?\w+$/m,
  'multi' : ['premiumize.me'],
  'title' : 'datei.to',
  'homepage' : 'http://datei.to/',
  'check' :function(link,cb,thisArg) {
    OCH_ByFindingString(link,"icon_deleted.png", cb, thisArg);
  },
},
'ddownload' : {
  'pattern' : [/^https?:\/\/(www\.)?ddl\.to\/\w+.*$/m, /^https?:\/\/ddownload\.com\/\w+.*$/m],
  'multi' : ['premiumize.me'],
  'title' : 'ddownload.com',
  'homepage' : 'https://ddl.to/',
  'check' :function(link,cb,thisArg) {
    OCH_ByFindingString(link,"File Not Found", cb, thisArg);
  },
},

'depositfiles' : {
  'pattern' : [/^http:\/\/dfiles\.eu\/files\/\w+\/?$/m,/^http:\/\/depositfiles\.com\/files\/\w+\/?$/m],
  'multi' : [],
  'title' : 'DepositFiles',
  'homepage' : 'http://dfiles.eu',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link,"no_download_message", cb, thisArg);
  },
},
'devilshare' : {
  'pattern' : /^https?:\/\/(www\.)?devilshare\.net\/view.+$/m,
  'multi' : ['nopremium.pl'],
  'title' : 'Offline: Devilshare.net',
  'homepage' : 'http://devilshare.net',
  'check' : function(link,cb,thisArg) {
    OCH_permanentlyoffline(link, cb, thisArg);
  }
},
'douploads' : {
  'pattern' : /^https?:\/\/(www\.)?douploads\.com\/\w{8}\w+$/m,
  'multi' : [],
  'title' : 'DoUploads',
  'homepage' : 'https://douploads.com/',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link,["File Not Found", "file was removed"], cb, thisArg);
  },
},
'dropapk' : {
  'pattern' : /^https?:\/\/(www\.)?dropapk\.to\/\w+.*$/m,
  'multi' : ['nopremium.pl'],
  'title' : 'Dropapk',
  'homepage' : 'https://dropapk.to/',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link,"File Not Found", cb, thisArg);
  },
},
'earn4files' : {
  'pattern' : /^https?:\/\/(www\.)?earn4files\.com\/\w+.*$/m,
  'multi' : [],
  'title' : 'Earn4Files',
  'homepage' : 'https://earn4files.com/',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link,"File Not Found", cb, thisArg);
  },
},
'expressleech' : {
  'pattern' : /^https?:\/\/(www\.)?expressleech\.com\/\w+\.html$/m,
  'multi' : [],
  'title' : 'ExpressLeech',
  'homepage' : 'http://expressleech.com/',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link,"File Not Found", cb, thisArg);
  },
},
'fastshare' : {
  'pattern' : /^https?:\/\/fastshare\.cz\/\d+\/.+$/m,
  'multi' : ['nopremium.pl'],
  'title' : 'FastShare.cz',
  'homepage' : 'https://fastshare.cz/',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link,'This file is no longer available', cb, thisArg);
  },
},
'faststore' : {
  'pattern' : /^https?:\/\/(www\.)?faststore\.org\/.+$/m,
  'multi' : [],
  'title' : 'Fast store',
  'homepage' : 'http://faststore.org/',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link,'<b class="err">', cb, thisArg);
  },
},
'file' : {
  'pattern' : /^https?:\/\/(www\.)?file\.al\/\w+\/?.*$/m,
  'multi' : ['premiumize.me'],
  'title' : 'File.AL',
  'homepage' : 'https://file.al/',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link,'File Not Found', cb, thisArg);
  },
},
'fileboom' : {
  'pattern' : [/^https?:\/\/(www\.)?fileboom\.me\/\w+\/?.*$/m, /^https?:\/\/(www\.)?fboom\.me\/\w+\/?.*$/m],
  'multi' : [],
  'title' : 'FileBoom.me',
  'homepage' : 'http://fileboom.me/',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link,'alert-block', cb, thisArg);
  },
},
'filecloud' : {
  'pattern' : /^http:\/\/filecloud\.io\/\w+(\/.*)?$/m,
  'multi' : [],
  'title' : 'filecloud.io',
  'homepage' : 'http://filecloud.io/',
  'check' : function(link,cb,thisArg) {
    // Ask filecloud API.
    // https://code.google.com/p/filecloud/wiki/CheckFile
    rq.add({
      method: "POST",
      url: "http://api.filecloud.io/api-check_file.api",
      data: "ukey="+encodeURIComponent(link.url.match(/filecloud\.io\/(\w+)(\/.*)?/)[1]),
      onload: function (response){
        var result = JSON.parse(response.responseText);
        if(result.status == "ok") {
          if(result.name) {
            // Link is online
            cb.call(thisArg,link,1);
          } else {
            // Link is offline
            cb.call(thisArg,link,0);
          }
        } else {
          cb.call(thisArg,link,-1,"Strange reply from filecloud API:\n"+response.responseText);
        }
      },
      onerror: function (response){
        cb.call(thisArg,link,0); // Offline
      }
    });
  },
},
'filefactory' : {
  'pattern' : /^https?:\/\/(www\.)?filefactory\.com\/file\/.+$/m,
  'multi' : ['nopremium.pl', 'premiumize.me'],
  'title' : 'FileFactory',
  'homepage' : 'http://www.filefactory.com',
  'check' : function(link,cb,thisArg) {
    OCH_ByMatchingFinalUrl(link,/error\.php\?code\=/, cb, thisArg);
  }
},
'fileflares' : {
  'pattern' : /^https?:\/\/fileflares.com\/\w+\/?.*$/m,
  'multi' : [],
  'title' : 'Offline: FileFlares.com',
  'homepage' : 'http://fileflares.com/',
  'check' : function(link,cb,thisArg) {
    OCH_permanentlyoffline(link, cb, thisArg);
  }
},
'filefox' : {
  'pattern' : /^https?:\/\/(www\.)?filefox\.cc\/\w+\/?.*$/m,
  'multi' : [],
  'title' : 'FileFox.cc',
  'homepage' : 'https://filefox.cc/',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link,'File could not be found', cb, thisArg);
  },
},
'filejoker' : {
  'pattern' : /^https?:\/\/(www\.)?filejoker\.net\/\w+\/?.*$/m,
  'multi' : [],
  'title' : 'FileJoker',
  'homepage' : 'https://filejoker.net/',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link,"File Not Found", cb, thisArg);
  }
},

'filemonkey' : {
  'pattern' : /^https?:\/\/www.filemonkey.in\/file\/.+$/m,
  'multi' : ['nopremium.pl'],
  'title' : 'Offline: Filemonkey.in',
  'homepage' : 'https://www.filemonkey.in/',
  'check' : function(link,cb,thisArg) {
   OCH_permanentlyoffline(link, cb, thisArg);
  }
},
'filenext' : {
  'pattern' : /^https?:\/\/www.filenext.com\/\w+\/.*$/m,
  'multi' : ['nopremium.pl'],
  'title' : 'Filenext',
  'homepage' : 'https://www.filenext.com/',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link,"File Not Found", cb, thisArg);
  }
},
'fileload' : {
  'pattern' : /^https:\/\/fileload\.io\/.+$/m,
  'multi' : [],
  'title' : 'fileload.io',
  'homepage' : 'https://fileload.io/',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link,"Not found", cb, thisArg);
  }
},
'filer' : {
  'pattern' : /^https:\/\/filer\.net\/get\/\w+$/m,
  'multi' : ['premiumize.me'],
  'title' : 'filer.net',
  'homepage' : 'https://filer.net/',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link,["Datei nicht mehr vorhanden","Not available","Not found"], cb, thisArg);
  }
},
'filescdn' : {
  'pattern' : /^https:\/\/filescdn\.com\/.+$/m,
  'multi' : [],
  'title' : 'filescdn.com',
  'homepage' : 'https://filescdn.com/',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link,"icon-warning text-danger", cb, thisArg);
  }
},
'fileshark' : {
  'pattern' : /^https?:\/\/(www\.)?fileshark\.pl\/pobierz\/\d+\/\w+\/.*$/m,
  'multi' : ['nopremium.pl'],
  'title' : 'fileshark.pl',
  'homepage' : 'https://fileshark.pl/',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link,"Nie znaleziono pliku w serwisie", cb, thisArg);
  }
},
'filespace' : {
  'pattern' : /^https?:\/\/(www\.)?filespace\.com\/\w+\/?$/m,
  'multi' : ['premiumize.me'],
  'title' : 'FileSpace',
  'homepage' : 'http://filespace.com/',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link,"File not found", cb, thisArg);
  }
},
'filestore' : {
  'pattern' : /^https?:\/\/filestore\.to\/\?d=\w+$/m,
  'multi' : ['premiumize.me'],
  'title' : 'Filestore',
  'homepage' : 'http://filestore.to/',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link,["File not found", "Datei nicht gefunden"], cb, thisArg);
  }
},
'fileup' : {
  'pattern' : /^https?:\/\/(www\.)?file-up\.org\/\w+\/?$/m,
  'multi' : [],
  'title' : 'file-up.org',
  'homepage' : 'https://file-up.org/',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link,"File Not Found", cb, thisArg);
  }
},
'fileupload' : {
  'pattern' : /^https?:\/\/(www\.)?file-upload\.com\/\w+\/?$/m,
  'multi' : [],
  'title' : 'FileUpload',
  'homepage' : 'https://www.file-upload.com/',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link,"File Not Found", cb, thisArg);
  }
},
'firedrive' : {
  'pattern' : /^http:\/\/www\.firedrive\.com\/file\/\w+$/m,
  'multi' : ['nopremium.pl'],
  'title' : 'Offline: Firedrive',
  'homepage' : 'http://www.firedrive.com/',
  'check' : function(link,cb,thisArg) {
    OCH_permanentlyoffline(link, cb, thisArg);
  }
},
'fireget' : {
  'pattern' : /^https?:\/\/fireget\.com\/\w+\/?.*$/m,
  'multi' : ['premiumize.me'],
  'title' : 'Fireget',
  'homepage' : 'http://fireget.com/',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link,"File Not Found", cb, thisArg);
  }
},
'freakshare' : {
  'pattern' : /^http:\/\/freakshare\.com\/files\/\w+\/.+\.html$/m,
  'multi' : [],
  'title' : 'FreakShare',
  'homepage' : 'http://freakshare.com/',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link,["This file does not exist","Dieser Download existiert nicht"], cb, thisArg);
  },
},
'free' : {
  'pattern' : /^http:\/\/dl\.free\.fr\/\w+$/m,
  'multi' : [],
  'title' : 'Free',
  'homepage' : 'http://dl.free.fr/',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link,["ERREUR","erreur","inexistant"], cb, thisArg);
  },
},
'gboxes' : {
  'pattern' : /^http:\/\/www\.gboxes\.com\/\w+.*$/m,
  'multi' : [],
  'title' : 'Offline: Green Boxes',
  'homepage' : 'http://www.gboxes.com/',
  'check' : function(link,cb,thisArg) {
    OCH_permanentlyoffline(link, cb, thisArg);
  }
},
'hitfile' : {
  'pattern' : [/^https?\:\/\/(www\.)?hitfile\.net\/\w+.*$/m, /^https?\:\/\/(www\.)?hil\.to\/\w+.*$/m],
  'multi' : ['nopremium.pl', 'premiumize.me'],
  'title' : 'Hitfile.net',
  'homepage' : 'http://hitfile.net/',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link,"File was deleted or not found", cb, thisArg);
  },
},
'hugefiles' : {
  'pattern' : /^http:\/\/hugefiles\.net\/\w+\/?.*$/m,
  'multi' : [],
  'title' : 'Offline: HugeFiles.net',
  'homepage' : 'http://hugefiles.net/',
  'check' : function(link,cb,thisArg) {
    OCH_permanentlyoffline(link, cb, thisArg);
  }
},
'inclouddrive' : {
  'pattern' : /^https:\/\/www\.inclouddrive\.com\/file\/\w+\/?.*$/m,
  'multi' : ['nopremium.pl'],
  'title' : 'inCLOUDdrive',
  'homepage' : 'https://www.inclouddrive.com/',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link,["no longer available", "has been removed", "has been deleted"], cb, thisArg);
  }
},
'isra' : {
  'pattern' : /^https:\/\/isra\.cloud\/\w+\/?.*$/m,
  'multi' : ['nopremium.pl', 'premiumize.me'],
  'title' : 'Isracloud',
  'homepage' : 'https://isra.cloud/',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link,"File Not Found", cb, thisArg);
  }
},
'katfile' : {
  'pattern' : /^https?:\/\/katfile\.com\/\w+\/?.*$/m,
  'multi' : ['nopremium.pl'],
  'title' : 'Katfile.com',
  'homepage' : 'http://katfile.com/',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link,["file not found", "File has been removed", "File Not Found", "The file expired", "Error</h3>"], cb, thisArg);
  },
},
'keep2share' : {
  'pattern' : [/^https?:\/\/keep2share\.cc\/file\/\w+\/?.*$/m, /^https?:\/\/(spa\.)?k2s\.cc\/file\/\w+\/?.*$/m],
  'multi' : [],
  'title' : 'Keep2Share',
  'homepage' : 'https://keep2share.cc/',
  'check' : function(link,cb,thisArg) {
    //  https://api.k2s.cc/v1/files/{id}
    var fileid = link.url.match(/file\/(\w+)\//)[1];
    rq.add({
      method: "GET",
      url: "https://api.k2s.cc/v1/files/" + fileid,
      onload: function (response){
        if(response.status == 401) {
           cb.call(thisArg,link,-1,"Please manually open the keep2share website at least once to initiate a proper session.");
           return;
        }
        if(response.status != 200 || !response.responseText) {
           cb.call(thisArg,link,0); // Offline
           return;
        } else {
          var jdata = JSON.parse(response.responseText);
          if(jdata["id"] != fileid) {
            cb.call(thisArg,link,0); // Offline
            return;
          }
          if(jdata["isDeleted"]) {
            cb.call(thisArg,link,0); // Offline
            return;
          }

          cb.call(thisArg,link,1); // Online
        }
      },
      onerror: function(response) {
        cb.call(thisArg,link,0); // Offline
      }
    });
  },
},
'kingfile' : {
  'pattern' : /^https?:\/\/(\w+\.)?kingfile\.pl\/download\/.+$/m,
  'multi' : ['nopremium.pl'],
  'title' : 'kingfile.pl',
  'homepage' : 'http://kingfile.pl/',
  'check' : function(link,cb,thisArg) {
    OCH_unkown(link, cb, thisArg);
  }
},
'kingfiles' : {
  'pattern' : /^https?:\/\/(www\.)?kingfiles\.net\/\w+.*$/m,
  'multi' : [],
  'title' : 'KingFiles.net',
  'homepage' : 'http://www.kingfiles.net/',
  'check' : function(link,cb,thisArg) {
    var s = ["The file you were looking for could not be found, sorry for any inconvenience","Reason for deletion"];
    rq.add({
      method: "GET",
      url: link.url,
      onload: function (response){
        if(response.responseText.length == 0) {
           cb.call(thisArg,link,0); // Offline
           return;
        } else {
          for(var i = 0; i < s.length; i++) {
            if(response.responseText.indexOf(s[i]) != -1) {
              cb.call(thisArg,link,0); // Offline
              return;
            }
          }
          cb.call(thisArg,link,1); // Online
        }
      },
      onerror: function (response){
        cb.call(thisArg,link,0); // Offline
      }
    });
  },
},
'letitbit' : {
  'pattern' : /^https?:\/\/(\w+\.)?letitbit\.net\/download\/(\w|\.)+\/.*$/m,
  'multi' : [],
  'title' : 'Offline: Letitbit.net',
  'homepage' : 'http://letitbit.net/',
  'check' : function(link,cb,thisArg) {
    OCH_permanentlyoffline(link, cb, thisArg);
  }
},
'lunaticfiles' : {
  'pattern' : /^https?:\/\/lunaticfiles\.com\/\w+\/?.*$/m,
  'multi' : ['nopremium.pl'],
  'title' : 'lunaticfiles.com',
  'homepage' : 'http://lunaticfiles.com/',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link,["File Not Found","Nie znaleziono pliku"], cb, thisArg);
  }
},
'mediafire' : {
  'pattern' : [/^https?:\/\/www\.mediafire\.com\/?\?.+$/m,/^https?:\/\/www\.mediafire\.com\/download\/.+$/m],
  'multi' : ['nopremium.pl', 'premiumize.me'],
  'title' : 'MediaFire',
  'homepage' : 'https://www.mediafire.com/',
  'check' : function(link,cb,thisArg) {
    OCH_ByMatchingFinalUrl(link,/error\.php/, cb, thisArg);
  },
},
'mega' : {
  'pattern' : [/^https?:\/\/mega\.co\.nz\/\#\!\w+!*(\w|-)*$/m, /^https?:\/\/mega\.nz\/\#\!\w+!*(\w|-)*$/m],
  'multi' : ['nopremium.pl', 'premiumize.me'],
  'title' : 'MEGA',
  'homepage' : 'https://mega.co.nz/',
  'check' : function(link,cb,thisArg) {
    // Ask mega.co.nz API
    rq.add({
      method: "POST",
      url: "https://eu.api.mega.co.nz/cs?id=0",
      data: '[{"a":"g","p":"' + link.url.match(/\#\!(\w+)\!/)[1] + '"}]',
      headers: {"Content-Type": "application/json"},
      onload: function (response){
        if(typeof JSON.parse(response.responseText)[0] == 'number') {
          // Link is offline
          cb.call(thisArg,link,0);
        } else {
          // Link is online
          cb.call(thisArg,link,1);
        }
      },
      onerror: function (response){
        cb.call(thisArg,link,0); // Offline
      }
    });
  },
},
'megaup' : {
  'pattern' : [/^https?:\/\/megaup\.net\/\w+\/?.*$/m],
  'multi' : ['nopremium.pl'],
  'title' : 'megaup.net',
  'homepage' : 'https://megaup.net/',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link,">File not found<", cb, thisArg);
  },
},
'mexashare' : {
  'pattern' : [/^https?:\/\/(www\.)?mexashare\.com\/\w+\/?.*$/m],
  'multi' : [],
  'title' : 'MexaShare',
  'homepage' : 'http://www.mexashare.com/',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link,"File Not Found", cb, thisArg);
  },
},
'mixloads' : {
  'pattern' : /^https?:\/\/mixloads\.com\/\w+.*$/m,
  'multi' : [],
  'title' : 'MixLoads.Com',
  'homepage' : 'https://mixloads.com/',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link,"File Not Found", cb, thisArg);
  },
},
'modsbase' : {
  'pattern' : [/^https?:\/\/modsbase\.com\/\w+\/?.*$/m],
  'multi' : ['premiumize.me'],
  'title' : 'modsbase',
  'homepage' : 'https://modsbase.com/',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link,"File Not Found", cb, thisArg);
  },
},
'nitroflare' : {
  'pattern' : [/^https?:\/\/nitroflare\.com\/view\/.+$/m],
  'multi' : [],
  'title' : 'NitroFlare',
  'homepage' : 'http://nitroflare.com/',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link,["be redirect to the main page", ' id="error"'], cb, thisArg);
  },
},
'novafile' : {
  'pattern' : [/^https?:\/\/(www\.)?novafile\.com\/\w+\/?.*$/m],
  'multi' : [],
  'title' : 'Novafile',
  'homepage' : 'http://novafile.com',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link,"File Not Found", cb, thisArg);
  },
},

'oboom' : {
  'pattern' : /^https?:\/\/www\.oboom\.com\/\w+.*$/m,
  'multi' : [],
  'title' : 'OBOOM.com',
  'homepage' : 'https://www.oboom.com/',
  'check' : function(link,cb,thisArg) {
    // Ask oboom API.
    rq.add({
      method: "GET",
      url: "https://api.oboom.com/1/info?items="+encodeURIComponent(link.url.match(/oboom\.com\/(\w+)/)[1]),
      onload: function (response){
        var result = JSON.parse(response.responseText);
        if(result[0] == 200) {
          if(result[1][0].state == "online") {
            // Link is online
            cb.call(thisArg,link,1);
          } else {
            // Link is offline
            cb.call(thisArg,link,0);
          }
        } else {
          cb.call(thisArg,link,-1,"Strange reply from oboom API:\n"+response.responseText)
        }
      },
      onerror: function (response){
        cb.call(thisArg,link,0); // Offline
      }
    });
  },
},
'openload' : {
  'pattern' : [/^https?:\/\/openload\.co\/f\/.+$/m],
  'multi' : ['nopremium.pl', 'premiumize.me'],
  'title' : 'Offline: Openload',
  'homepage' : 'http://openload.co/',
  'check' : function(link,cb,thisArg) {
    OCH_permanentlyoffline(link, cb, thisArg);
  },
},
'ozofiles' : {
  'pattern' : [/^https?:\/\/ozofiles\.com\/\w+\/.*$/m],
  'multi' : ['nopremium.pl'],
  'title' : 'Ozofiles.com',
  'homepage' : 'http://ozofiles.com/',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link,"File Not Found", cb, thisArg);
  },
},
'potload' : {
  'pattern' :/^http:\/\/potload\.com\/\w+$/m,
  'multi' : [],
  'title' : 'Offline: Potload',
  'homepage' : 'http://potload.com/',
  'check' : function(link,cb,thisArg) {
    OCH_permanentlyoffline(link, cb, thisArg);
  }
},
'publish2me' : {
  'pattern' : /^https?:\/\/publish2\.me\/file\/\w+\/?.*$/m,
  'multi' : [],
  'title' : 'Publish.me',
  'homepage' : 'https://publish2.me/',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link,"alert-block", cb, thisArg);
  },
},
'rapidgator' : {
  'pattern' : [/^https?:\/\/rapidgator\.net\/file\/[^#]+$/m,/^https?:\/\/rg\.to\/file\/[^#]+$/m],
  'multi' : ['nopremium.pl'],
  'title' : 'Rapidgator.net',
  'homepage' : 'http://rapidgator.net/',
  'check' : function(link,cb,thisArg) {
    OCH_ByMatchingFinalUrl(link,/article\/premium/, cb, thisArg);
  }
},
'rapidu' : {
  'pattern' :/^https?:\/\/(\w+\.)?rapidu\.net\/\d+\/.*$/m,
  'multi' : ['nopremium.pl'],
  'title' : 'Rapidu.net',
  'homepage' : 'https://rapidu.net/',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link,"File not found", cb, thisArg);
  },
},
'rapidrar' : {
  'pattern' :/^https?:\/\/(\w+\.)?rapidrar\.com\/\w+.*$/m,
  'multi' : ['nopremium.pl'],
  'title' : 'RapidRAR',
  'homepage' : 'https://rapidrar.com/',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link,"File Not Found", cb, thisArg);
  },
},
'rioupload' : {
  'pattern' : /^http:\/\/(www\.)?rioupload\.com\/\w+$/m,
  'multi' : [],
  'title' : 'RioUpload',
  'homepage' : 'http://rioupload.com/',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link,"File Not Found", cb, thisArg);
  },
},
'rockfile' : {
  'pattern' : /^https?\:\/\/(www\.)?rockfile\.(eu|co)\/\w+.*$/m,
  'multi' : ['nopremium.pl'],
  'title' : 'Rockfile.co',
  'homepage' : 'http://rockfile.co',
  'check' : function(link,cb,thisArg) {
    // Rockfile has cloudfare protection with a cookie check.
    rq.add({
      method: "GET",
      url: link.url,
      onprogress: function(response) {
        // abort download of big files
        if((Math.max(response.loaded,response.total)/1024) > MAXDOWNLOADSIZE) {
          this.__result.abort();
          cb.call(thisArg,link,1); // Let's assume big files are online
        }
      },
      onload: function (response){
        if(response.responseText.indexOf("Checking your browser before accessing") != -1) {
          cb.call(thisArg,link,-1,"Cloudfare protection, please manually open the website at least once."); // Cloudfare protection
          return;
        }
        else if(response.responseText.indexOf("File Not Found") != -1 || response.responseText.indexOf("fa-chain-broken") != -1 ) {
          cb.call(thisArg,link,0); // Offline
          return;
        }
        cb.call(thisArg,link,1); // Online
      },
      onerror: function (response){
        cb.call(thisArg,link,0); // Offline
      }
    });

  },
},
'rusfolder' : {
  'pattern' : /^http:\/\/rusfolder\.com\/\d+$/m,
  'multi' : [],
  'title' : 'Rusfolder.com',
  'homepage' : 'http://rusfolder.com/',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link,"File not found.", cb, thisArg);
  },
},
'salefiles' : {
  'pattern' : /^http:\/\/salefiles\.com\/\w+\/?.*$/m,
  'multi' : [],
  'title' : 'Salefiles',
  'homepage' : 'http://salefiles.com',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link,"File Not Found", cb, thisArg);
  },
},
'share-online' : {
  'pattern' : /^http:\/\/www\.share-online\.biz\/dl\/\w+$/m,
  'multi' : [],
  'title' : 'Share-Online',
  'homepage' : 'http://www.share-online.biz/',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link,["The requested file is not available","Die angeforderte Datei konnte nicht gefunden werden"], cb, thisArg);
  },
},
'sockshare' : {
  'pattern' : /^http:\/\/www\.sockshare\.com\/file\/\w+$/m,
  'multi' : ['nopremium.pl'],
  'title' : 'Offline: SockShare',
  'homepage' : 'http://www.sockshare.com/',
  'check' : function(link,cb,thisArg) {
    OCH_permanentlyoffline(link, cb, thisArg);
  }
},

'soundcloud' : {
  'pattern' : /^https?:\/\/soundcloud.com\/(\w|-)+\/(\w|-)+$/m,
  'multi' : [],
  'title' : 'SoundCloud',
  'homepage' : 'https://soundcloud.com/',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link,"We can't find that track.", cb, thisArg);
  },
},
'storebit' : {
  'pattern' : /^https?:\/\/(www\.)?storbit\.net\/file\/.+$/m,
  'multi' : ['nopremium.pl'],
  'title' : 'Offline: Storbit.net',
  'homepage' : 'http://storbit.net',
  'check' : function(link,cb,thisArg) {
    OCH_permanentlyoffline(link, cb, thisArg);
  }
},
'spicyfile' : {
  'pattern' : /^https?:\/\/(www\.)?spicyfile\.com\/\w+$/m,
  'multi' : ['premiumize.me'],
  'title' : 'spicyfile.com',
  'homepage' : 'http://spicyfile.com',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link,"File Not Found", cb, thisArg);
  }
},
'streamcloud' : {
  'pattern' : /^http:\/\/streamcloud\.eu\/\w+$/m,
  'multi' : [],
  'title' : 'Offline: Streamcloud',
  'homepage' : 'http://streamcloud.org/',
  'check' : function(link,cb,thisArg) {
    OCH_permanentlyoffline(link, cb, thisArg);
  }
},
'streamin' : {
  'pattern' : /^https?:\/\/streamin\.to\/.+$/m,
  'multi' : ['nopremium.pl'],
  'title' : 'Streamin.to',
  'homepage' : 'http://streamin.to/',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link,"File Deleted", cb, thisArg);
  },
},
'subyshare' : {
  'pattern' : /^https?:\/\/subyshare\.com\/\w+\/?.*$/m,
  'multi' : [],
  'title' : 'Subyshare.com',
  'homepage' : 'http://subyshare.com/',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link,"File Not Found", cb, thisArg);
  },
},
'suprafiles' : {
  'pattern' : [/^https?:\/\/suprafiles\.(me|net|org)\/\w+\/?.*$/m, /^https?:\/\/srfiles\.com\/\w+\/?.*$/m],
  'multi' : [],
  'title' : 'Offline: Suprafiles',
  'homepage' : 'http://suprafiles.org/',
  'check' : function(link,cb,thisArg) {
    OCH_permanentlyoffline(link, cb, thisArg);
  },
},
'turbobit' : {
  'pattern' : [/^https?:\/\/turbobit\.net\/\w+.*\.html$/m, /^https?:\/\/turb\.(to|cc)\/\w+.*\.html$/m],
  'multi' : ['nopremium.pl', 'premiumize.me'],
  'title' : 'turbobit.net',
  'homepage' : 'http://turbobit.net/',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link,["File not found","File was not found"], cb, thisArg);
  },
},
'tusfiles' : {
  'pattern' : /^https?:\/\/(www\.)?tusfiles\.net\/\w+$/m,
  'multi' : ['nopremium.pl'],
  'title' : 'TusFiles',
  'homepage' : 'http://tusfiles.net/',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link,"The file you are trying to download is no longer available", cb, thisArg);
  },
},
'ubiqfile' : {
  'pattern' : /^https?:\/\/ubiqfile\.com\/\w+$/m,
  'multi' : ['premiumize.me'],
  'title' : 'ubiqfile',
  'homepage' : 'http://ubiqfile.com/',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link,"File Not Found", cb, thisArg);
  },
},
'unibytes' : {
  'pattern' : /^http:\/\/www\.unibytes\.com\/\w+-\w+$/m,
  'multi' : ['nopremium.pl'],
  'title' : 'Unibytes.com',
  'homepage' : 'http://www.unibytes.com/',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link,"File not found", cb, thisArg);
  },
},
'unlimitzone' : {
  'pattern' : /^http:\/\/unlimitzone\.com\/\w+.*$/m,
  'multi' : [],
  'title' : 'Unlimit Zone',
  'homepage' : 'http://unlimitzone.com/',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link,"File Not Found", cb, thisArg);
  },
},
'up07' : {
  'pattern' : /^https?:\/\/up07\.net\/\w+$/m,
  'multi' : [],
  'title' : 'up07.net',
  'homepage' : 'http://up07.net/',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link,"File Not Found", cb, thisArg);
  },
},
'upera' : {
  'pattern' : /^http:\/\/public\.upera\.co\/\w+$/m,
  'multi' : [],
  'title' : 'Upera',
  'homepage' : 'http://public.upera.co/',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link,"Invalid or Deleted File", cb, thisArg);
  },
},
'uploadable' : {
  'pattern' : /^http:\/\/www\.uploadable\.ch\/file\/\w+\/(\w|-|\.)+$/m,
  'multi' : [],
  'title' : 'Offline: Uploadable.ch',
  'homepage' : 'http://www.uploadable.ch/',
  'check' : function(link,cb,thisArg) {
    OCH_permanentlyoffline(link, cb, thisArg);
  }
},
'uploadac' : {
  'pattern' : [/^https?:\/\/upload\.ac\/\w+\/?.*$/m, /^https?:\/\/uplod\.io\/\w+\/?.*$/m],
  'multi' : [],
  'title' : 'Upload.ac',
  'homepage' : 'https://upload.ac/',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link,"No File Found", cb, thisArg);
  }
},
'uploadboy' : {
  'pattern' : /^http:\/\/(www\.)?uploadboy\.com\/\w+\.html$/m,
  'multi' : ['nopremium.pl'],
  'title' : 'Uploadboy.com',
  'homepage' : 'http://uploadboy.com/',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link,"File Not Found", cb, thisArg);
  },
},
'uploaded' : {
  'pattern' : [/^https?:\/\/uploaded\.(net|to)\/file\/.+$/m,/^http:\/\/ul\.to\/.+$/m],
  'multi' : ['nopremium.pl', 'premiumize.me'],
  'title' : 'uploaded.net',
  'homepage' : 'http://uploaded.net/',
  'check' : function(link,cb,thisArg) {
    //OCH_ByMatchingFinalUrl(link,[/uploaded\.net\/404/,/uploaded\.net\/410/], cb, thisArg);
    OCH_ByFindingString(link,"Error: ", cb, thisArg);
  },
},
'uploadboy' : {
  'pattern' : /^https?:\/\/uploadboy\.(me|com)\/\w+\/?.*$/m,
  'multi' : ['premiumize.me'],
  'title' : 'Uploadboy',
  'homepage' : 'https://uploadboy.com/',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link,["not be found", "File not found"], cb, thisArg);
  },
},
'uploadgig' : {
  'pattern' : /^https?:\/\/uploadgig\.com\/file\/download\/\w+\/?.*$/m,
  'multi' : ['nopremium.pl'],
  'title' : 'UploadGIG',
  'homepage' : 'https://uploadgig.com/',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link,"File not found", cb, thisArg);
  },
},
'uploadingcom' : {
  'pattern' : /^http:\/\/uploading\.com\/\w+\/?.*$/m,
  'multi' : ['nopremium.pl'],
  'title' : 'Uploading.com',
  'homepage' : 'http://uploading.com/',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link,['class="file_error"',"file not found","file was removed"], cb, thisArg);
  },
},
'uploading' : {
  'pattern' : /^http:\/\/(www\.)?uploading\.site\/\w+.*$/m,
  'multi' : ['nopremium.pl'],
  'title' : 'Uploading.site',
  'homepage' : 'http://uploading.site/',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link,["cannot be found", "was removed", "for deletion"], cb, thisArg);
  },
},
'uploadocean' : {
  'pattern' : /^https?:\/\/uploadocean\.com\/\w+$/m,
  'multi' : [],
  'title' : 'UploadOcean',
  'homepage' : 'http://uploadocean.com/',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link, 'deleted.png"', cb, thisArg);
  },
},
'uploadon' : {
  'pattern' : /^http:\/\/uploadon\.me\/\w+\.html$/m,
  'multi' : [],
  'title' : 'Uploadon.me',
  'homepage' : 'http://uploadon.me/',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link, ["File not found", "This page was not found"], cb, thisArg);
  },
},
'uploadrocket' : {
  'pattern' : /^http:\/\/uploadrocket\.net\/\w+(\/|\w|-|\.)+(\.html)?$/m,
  'multi' : ['nopremium.pl'],
  'title' : 'UploadRocket.net',
  'homepage' : 'http://uploadrocket.net/',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link,"The file was removed by administrator", cb, thisArg);
  },
},
'uppit' : {
  'pattern' : /^http:\/\/uppit\.com\/\w+(\/.*)?$/m,
  'multi' : [],
  'title' : 'UppIT',
  'homepage' : 'http://uppit.com/',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link,"File Not Found", cb, thisArg);
  },
},
'uptobox' : {
  'pattern' : /^https?:\/\/uptobox.com\/\w+(\/.*)?$/m,
  'multi' : ['nopremium.pl'],
  'title' : 'Uptobox',
  'homepage' : 'http://uptobox.com/',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link,'<span class="para_title">File not found', cb, thisArg);
  },
},
'userscloud' : {
  'pattern' : /^https?:\/\/userscloud\.com\/\w+.*$/m,
  'multi' : ['premiumize.me'],
  'title' : 'Userscloud',
  'homepage' : 'https://userscloud.com/',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link,["label-danger", "The file is no longer available"], cb, thisArg);
  },
},
'usersdrive' : {
  'pattern' : /^https?:\/\/usersdrive\.com\/\w+.*$/m,
  'multi' : [],
  'title' : 'Usersdrive',
  'homepage' : 'https://usersdrive.com/',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link,"File Not Found", cb, thisArg);
  },
},
'vevo' : {
  'pattern' : /^https?:\/\/www\.vevo\.com\/watch\/.+$/m,
  'multi' : [],
  'title' : 'VEVO',
  'homepage' : 'https://www.vevo.com/',
  'check' : function(link,cb,thisArg) {
    // At the moment there seems to be no straightforward way to get the online/offline status
    cb.call(thisArg,link,1); // Online
  }
},
'vidlox' : {
  'pattern' : /^https?:\/\/vidlox\.me\/\w+.*$/m,
  'multi' : ['nopremium.pl'],
  'title' : 'vidlox.me',
  'homepage' : 'https://vidlox.me/',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link,"File Not Found", cb, thisArg);
  }
},
'vidoza' : {
  'pattern' : /^https?:\/\/vidoza\.org\/\w+.*$/m,
  'multi' : ['nopremium.pl'],
  'title' : 'vidoza.org',
  'homepage' : 'https://vidoza.org/',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link,["File Not Found", "file was deleted", "File was deleted", "Video is processing now"], cb, thisArg);
  }
},
'vidto' : {
  'pattern' : /^https?:\/\/vidto\.me\/\w+\.?\w*$/m,
  'multi' : ['nopremium.pl'],
  'title' : 'vidto.me',
  'homepage' : 'http://vidto.me/',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link,"File Not Found", cb, thisArg);
  }
},
'vimeo' : {
  'pattern' : /^https?:\/\/vimeo\.com\/(.+\/)?\d+\/?$/m,
  'multi' : [],
  'title' : 'Vimeo',
  'homepage' : 'https://vimeo.com/',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link,"Page not found", cb, thisArg);
  }
},
'vipfile' : {
  'pattern' : /^http:\/\/(\w+.)?vip-file.(com|net)\/downloadlib\/.*$/m,
  'multi' : [],
  'title' : 'VIP-file',
  'homepage' : 'http://vip-file.net/',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link,"File not found", cb, thisArg, link.url+"?lang=en");
  }
},
'wdupload' : {
  'pattern' : /^https?:\/\/www\.wdupload\.com\/file\/\w+\/?.*$/m,
  'multi' : ['premiumize.me'],
  'title' : 'wdupload.com',
  'homepage' : 'http://wdupload.com/',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link,"file-error", cb, thisArg);
  }
},
'worldbytez' : {
  'pattern' : /^https?:\/\/worldbytez\.com\/\w+$/m,
  'multi' : ['premiumize.me'],
  'title' : 'worldbytez.com',
  'homepage' : 'https://worldbytez.com/',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link,"File Not Found", cb, thisArg);
  }
},
'wrzucajpliki' : {
  'pattern' : /^https?:\/\/wrzucajpliki\.pl\/\w{0,6}.*$/m,
  'multi' : ['premiumize.me'],
  'title' : 'wrzucajpliki.pl',
  'homepage' : 'http://wrzucajpliki.pl/',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link,"File Not Found", cb, thisArg);
  }
},
'xubster' : {
  'pattern' : /^https?:\/\/(www\.)?xubster\.com\/\w+\/?.*$/m,
  'multi' : ['premiumize.me'],
  'title' : 'xubster.com',
  'homepage' : 'https://xubster.com/',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link,"File Not Found", cb, thisArg);
  },
},
'youtube' : {
  'pattern' : /^https?:\/\/www\.youtube\.com\/watch(\?v=|\/).+$/m,
  'multi' : ['nopremium.pl'],
  'title' : 'YouTube',
  'homepage' : 'https://www.youtube.com/',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link,"<title>YouTube</title>", cb, thisArg);
  },
},
'zippyshare' : {
  'pattern' : /^https?:\/\/www\d*\.zippyshare\.com\/v\/\w+\/file\.html$/m,
  'multi' : ['nopremium.pl', 'premiumize.me'],
  'title' : 'Zippyshare.com',
  'homepage' : 'http://www.zippyshare.com/',
  'check' : function(link,cb,thisArg) {
    OCH_ByFindingString(link,"does not exist", cb, thisArg);
  }
}


}
}
