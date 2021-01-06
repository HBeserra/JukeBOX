
var STATUS = {
  userID: null,
  trackURI: null,
  connection: true,
  state: null,
  track: {
    id: null,
    timestamp: null,
    isPlying: false,
    startPoint: null,
    duration: null,
  },
  changeState: {
    playing: playerScreen,
    stop: ()=>{mensageScreen("Nenhuma musica","toque uma musica pelo Spotify","fas fa-music")},
    noUser: ()=>{mensageScreen("Da um play","toque uma musica pelo Spotify","fab fa-spotify")},
    noConnection: ()=>{mensageScreen("Erro","Verifique a conexão","fab fa-exclamation-circle")},
    error: (text, icon="fab fa-exclamation-circle")=>{mensageScreen("Erro",text,icon,true)},
  },
  changeUser: function(ID) {
    getData((ID)?`/web-api/v1/users/${ID}`:"/web-api/v1/me", null, (a) => {
      if (a) {
        STATUS.userID = a.id
        STATUS.connection = true
        console.info(`New User ID: ${STATUS.userID}`)
        if(!ID)getData("/web-api/v1/me/player?market=BR&additional_types=episode", null, updatePlayer)
      }
    })
  },
  changeTrack: function() {},
}

var BaseURL = "localhost:24879"

function start() {
  STATUS.changeUser()
  if (!STATUS.connection) {
    STATUS.changeState.noConnection()
  } else {
    window.setInterval(autoTime, 200);
  }
}

function updatePlayer(response) {
  console.log(response)
  $('#episode').hide()
  $('#box').hide();
  $('#nomusic').hide();

  console.info(response, response.hasOwnProperty('track'), response.hasOwnProperty('episode.coverImage'))

  var data = {};
  let dataOk;
  if (response.hasOwnProperty('track')) {
    $('#like').show();

    response.track.album.coverGroup.image.forEach(element => {
      element.url = `https://i.scdn.co/image/${element.fileId.toLowerCase()}`
    });

    data.title = response.track.name
    data.artist = stringArtists(response.track.artist)
    data.images = response.track.album.coverGroup.image
    data.id = STATUS.track.id


    //STATUS.track.uri = response.track.gid.toLowerCase()
    STATUS.track.duration = response.track.duration
    STATUS.track.startPoint = 0;
    console.log(STATUS.track)
    dataOk = true
  } else if (response.hasOwnProperty('episode')) {
    $('#like').hide()

    response.episode.coverImage.image.forEach(element => {
      element.url = `https://i.scdn.co/image/${element.fileId.toLowerCase()}`
    });

    data.title = response.episode.name
    data.artist = response.episode.show.name
    data.images = response.episode.coverImage.image

    STATUS.track.duration = response.episode.duration
    STATUS.track.startPoint = 0;
    31
    dataOk = true
  } else if (response.hasOwnProperty('currently_playing_type')) {
    if(response.device.name != "JukeBOX") {
      STATUS.changeState.stop()
      return;
    } 
    if (response.item.type == "track") $('#like').show();
    else $('#like').hide()
    data.title = response.item.name
    data.artist = (response.item.type == "track") ? stringArtists(response.item.artists) : response.item.show.name
    data.images = (response.item.type == "track") ? response.item.album.images : response.item.images
    data.id = response.item.id

    STATUS.track.id = response.item.id

    STATUS.track.timestamp = response.timestamp
    STATUS.track.isPlying = response.is_playing
    STATUS.track.startPoint = response.progress_ms
    STATUS.track.duration = response.item.duration_ms

    dataOk = true;

  } else {
    console.warn("Data outside the expected standards", response)
    STATUS.changeState.error("erro desconhecido")
  }


  data.images.sort(compareImages);

  console.log(data)
  if (dataOk) {
    $('#box').show();
    ScreenMusic(data) //função de carregamento na tela
  } else {
    $('#nomusic').show();
  }

}


function getData(RequestURL, RequestHEAD, responseFunction) {
  try {
    $.ajax({
      url: "http://" + BaseURL + RequestURL,
      headers: RequestHEAD,
      success: (data, textStatus, xhr) => {
        if (xhr.status == 200) responseFunction(data)
        else if (xhr.status == 204) {
          STATUS.userID = null;
          STATUS.track.uri = null;
          STATUS.changeState.noUser()
        } else {
          console.log(data, textStatus, xhr);
          STATUS.changeState.error("erro desconhecido")
        }
      },
      error: function (xhr, ajaxOptions, thrownError) {
        console.error("getData()")
        if (xhr.code == 500) {
          STATUS.userID = null;
          STATUS.track.uri = null;
          STATUS.changeState.noUser() 
          
        } else if (xhr.code == 503) {
          STATUS.userID = null;
          STATUS.track.uri = null;
          STATUS.changeState.noConnection()
        } else {
          console.log(xhr, ajaxOptions, thrownError);
          STATUS.changeState.error("erro desconhecido")
          STATUS.connection = false
        }

      },
    })
  } catch (error) {
    STATUS.changeState.error("erro desconhecido")
  }


}

function contextChanged(info) {
  console.log("contextChanged");
  if (info.uri.includes("user")) {
    STATUS.changeUser(info.uri.substring(  info.uri.indexOf("user:") + 5,info.uri.lastIndexOf(":")));  
  }
}

function trackChanged(info) {
  console.log("trackChanged",info);
  STATUS.track.timestamp = Date.now()
  STATUS.track.duration = info.track.duration
  STATUS.track.uri = response.track.gid.toLowerCase()
  STATUS.track.isPlying = true
}

function playbackPaused(info) {
  console.log("playbackPaused");
  STATUS.track.isPlying = false
  STATUS.track.startPoint = info.trackTime
}

function playbackResumed(info) {
  STATUS.track.timestamp = Date.now()
  console.log("playbackResumed");
  STATUS.changeState.playing()
  STATUS.track.startPoint = info.trackTime
  STATUS.track.isPlying = true
}

function volumeChanged(info) {
  console.log("volumeChanged");
}

function trackSeeked(info) {
  console.log("trackSeeked");
  //STATUS.track.isPlying = false
  STATUS.track.startPoint = info.trackTime
}


function playbackHaltStateChanged(info) {
  console.log("playbackHaltStateChanged");
}

function sessionCleared(info) {
  console.log("sessionCleared");
}

function sessionChanged(info) {
  console.log("sessionChanged");
}

function inactiveSession(info) {
  STATUS.changeState.stop()
}

function connectionDropped(info) {
  console.log("connectionDropped");
}

function connectionEstablished(info) {
  console.log("connectionEstablished");
}

function panic(info) {
  console.error("panic");
  STATUS.changeState.error("Panic")
}

function ScreenMusic(x) {
  var colors = [];
  Vibrant.from(x.images[0].url).getSwatches((err, swatches) => {
    let ourColours = [];
    for (let key in swatches) {

      if (swatches.hasOwnProperty(key) && (swatches[key]) != null) {
        ourColours.push({
          color: (swatches[key]).getHex()
        });
      }
    }
    let x = (ourColours[Math.floor(Math.random() * ourColours.length)])
    x.color
    
    document.querySelector("#right div").style.color = (brightnessByColor(x.color) < 0.7) ? "#ffffff" : "000000"
    document.querySelector("#time_bar").style.backgroundColor = (brightnessByColor(x.color) < 0.7) ? "#ffffff" : "000000"
    document.querySelector("#time_bar").style.borderColor = (brightnessByColor(x.color) < 0.7) ? "#ffffff" : "000000"

    document.querySelector('#box').style.background = `linear-gradient(90deg,${x.color} 0%,${x.color} 100%)`

  });


  document.querySelector("#right h1").innerText = x.title
  document.querySelector("#right p").innerText = x.artist
  document.querySelector('#left div').style.backgroundImage = "url('" + x.images[0].url + "')"

  try { document.querySelector("#like").classList.remove(!x.item.like ? "fas" : "far") } catch (error) { }
  try {
    if(x.id)getData(`/web-api/v1/me/tracks/contains?ids=${x.id}`, null, (response) => {
      document.querySelector("#like").classList.add(response[0] ? "fas" : "far")
    })
  } catch (erro) { console.error(erro)}

}

function brightnessByColor(color) {
  var color = "" + color, isHEX = color.indexOf("#") == 0, isRGB = color.indexOf("rgb") == 0;
  if (isHEX) {
    const hasFullSpec = color.length == 7;
    var m = color.substr(1).match(hasFullSpec ? /(\S{2})/g : /(\S{1})/g);
    if (m) var r = parseInt(m[0] + (hasFullSpec ? '' : m[0]), 16), g = parseInt(m[1] + (hasFullSpec ? '' : m[1]), 16), b = parseInt(m[2] + (hasFullSpec ? '' : m[2]), 16);
  }
  if (isRGB) {
    var m = color.match(/(\d+){3}/g);
    if (m) var r = m[0], g = m[1], b = m[2];
  }
  if (typeof r != "undefined") return ((r * 299) + (g * 587) + (b * 114)) / 255000;
}

function stringArtists(artist) {
  let artists = "";

  for (let index = 0; index < artist.length; index++) {
    if (index > 0 && index != artist.length) {
      artists += `, ${artist[index].name}`
    } else {
      artists += artist[index].name
    }
  }

  return artists
}

function compareImages(a, b) {
  if (a.width < b.width) {
    return 1;
  }
  if (a.width > b.width) {
    return -1;
  }
  return 0;
}

function autoTime() {
  //if (!STATUS.track.isPlying) return
  actualTime = Date.now() - STATUS.track.timestamp + STATUS.track.startPoint;
  if(!STATUS.track.isPlying) actualTime = STATUS.track.startPoint;
  actualduration = STATUS.track.timestamp + STATUS.track.duration;
  document.querySelector("#time_bar").style.width = ((actualTime / STATUS.track.duration) * 100) + "%"
  document.querySelector('#progress_ms').innerText = convertMS(actualTime)
  document.querySelector('#duration_ms').innerText = convertMS(STATUS.track.duration)
} 

window.addEventListener('offline', STATUS.changeState.noConnection())

const alertOnlineStatus = () => { window.alert(navigator.onLine ? 'online' : 'offline') }

function playerScreen() {
  $('#messageScreen').hide()
  $("#box").show()
}
function mensageScreen(title,text,icon,error) {
  document.querySelector("#messageScreen div").innerHTML = "<i></i><h4></h4><h2></h2>"
  document.querySelector("#messageScreen div h4").innerText = title
  document.querySelector("#messageScreen div h2").innerText = text
  document.querySelector("#messageScreen div i").className = icon
  $('#messageScreen').show()
  $("#box").hide()
  error = error || 0;
  if (error) console.error(title,text)
}


function connect(){

  let socket = new WebSocket(`ws://${BaseURL}/events`);
  
  socket.onopen = function (e) {
    console.log("[open] Connection established");
    start();
  };

  socket.onmessage = function (event) {
    var json_data = JSON.parse(event.data);
    console.log(json_data)
    if (json_data.event == "contextChanged") contextChanged(json_data);
    else if (json_data.event == "trackChanged") trackChanged(json_data);
    else if (json_data.event == "playbackPaused") playbackPaused(json_data);
    else if (json_data.event == "playbackResumed") playbackResumed(json_data);
    else if (json_data.event == "volumeChanged") volumeChanged(json_data);
    else if (json_data.event == "trackSeeked") trackSeeked(json_data);
    else if (json_data.event == "metadataAvailable") updatePlayer(json_data);
    else if (json_data.event == "playbackHaltStateChanged") playbackHaltStateChanged(json_data);
    else if (json_data.event == "sessionCleared") sessionCleared(json_data);
    else if (json_data.event == "sessionChanged") sessionChanged(json_data);
    else if (json_data.event == "inactiveSession") inactiveSession(json_data);
    else if (json_data.event == "connectionDropped") connectionDropped(json_data);
    else if (json_data.event == "connectionEstablished") connectionEstablished(json_data);
    else if (json_data.event == "panic") panic(json_data);
    else console.log({ Unknow_backend_mensage: json_data })
  };
  
  socket.onclose = function (event) {
    if (event.wasClean) {
      console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
    } else {
      // e.g. server process killed or network down
      // event.code is usually 1006 in this case
      console.log('[close] Connection died');
    }
    STATUS.changeState.error("Perda de conexão com o backend")
    setTimeout(function() {connect();}, 1000);

  };
  
  socket.onerror = function (error) {
    console.error(`[error] ${error.message}`,error);
    STATUS.changeState.error("Perda de conexão com o backend")
    let socket = new WebSocket(`ws://${BaseURL}/events`);
  };
}
function convertMS(milliseconds) {
  var minute, seconds;
  seconds = Math.floor(milliseconds / 1000);
  minute = Math.floor(seconds / 60);
  seconds = seconds % 60;


  if (seconds < 10) {
      seconds = '0' + seconds
  }
  if (minute < 10) {
      minute = '0' + minute
  }
  return (minute + ":" + seconds)
}

connect()
