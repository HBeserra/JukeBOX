
var log = {
    'currently_playing': false
}
var displayStatus = [true, true]
var t,
    id,
    music_time,
    backgroundBlack = false;

(() => {

    /**
     * Obtains parameters from the hash of the URL
     * @return Object
     */
    function getHashParams() {
        var hashParams = {};
        var e, r = /([^&;=]+)=?([^&;]*)/g,
            q = window.location.hash.substring(1);
        while (e = r.exec(q)) {
            hashParams[e[1]] = decodeURIComponent(e[2]);
        }
        return hashParams;
    }
          /*
                var userProfileSource = document.getElementById('user-profile-template').innerHTML,
                  userProfileTemplate = Handlebars.compile(userProfileSource),
                  userProfilePlaceholder = document.getElementById('user-profile');
          
                var oauthSource = document.getElementById('oauth-template').innerHTML,
                  oauthTemplate = Handlebars.compile(oauthSource),
                  oauthPlaceholder = document.getElementById('oauth');
          
                */var params = getHashParams();

    var access_token = params.access_token,
        refresh_token = params.refresh_token,
        error = params.error;

    if (error) {
        alert('There was an error during the authentication');
    } else {
        if (access_token) {
            console.groupCollapsed("For devs")
            console.info(`Para o ativar log's for dev's `)
            console.log(log)
            console.groupEnd()
            window.t = refresh_token
            loop()
            myVar = setInterval(loop, 1000)
        } else {
            // render initial screen
            document.getElementById("log").style.display = "flex"
            $('#box').hide()
            //$('#loggedin').hide();
        }
    }
})();




function loop() {
    try {
        $.ajax({
            url: '/currently-playing',
            headers: {
                'access_token': access_token,
                'music_id': window.id
            },
            success: function (response) {
                if ((response === null) || (response.is_playing === null)) {
                    console.erro("Erro")
                    refreshToken()
                    return 0
                }
                $('#episode').hide()
                $('#box').hide();
                $('#nomusic').hide();

                switch (response.currently_playing_type) {
                    case "episode":
                        $('#box').show();
                        if (response.item != null) { ScreenMusic(response); window.id = response.id } //função de carregamento na tela
                        TimeBar(response.progress_ms, response.duration_ms)

                        break;
                    case "track":
                        $('#box').show();
                        if (response.item != null) { ScreenMusic(response); window.id = response.id } //função de carregamento na tela
                        TimeBar(response.progress_ms, response.duration_ms)

                        break;
                    default:
                        $('#nomusic').show();
                        break;
                }

                log.currently_playing ? console.info(response) : null

                /*            document.querySelector('#box').style.background = "linear-gradient(90deg, " + response.color[0] + "FF 0%, " + response.color[0] + "B3   100%)"
                              document.querySelector('#right div').style.color = response.color[1]
                              */

            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log(xhr, ajaxOptions, thrownError);
                console.error("Erro na api /currently-playing")
                refreshToken()
            }
        })
    } catch (error) {
        console.error("Erro na api /currently-playing - " + error)
        refreshToken()
    }
}

function ScreenMusic(x) {
    document.querySelector("#right h1").innerText = x.item.name
    document.querySelector("#right p").innerText = x.item.artists
    document.querySelector('#left div').style.backgroundImage = "url('" + x.item.images[0] + "')"
    document.querySelector('#box').style.background = (backgroundBlack) ? `transparent` : `linear-gradient(90deg,${x.item.color[0]}FF 0%,${x.item.color[0]}B3 100%)`

    document.querySelector("#right div").style.color = (backgroundBlack) ? "#fff" : x.item.color[1]
    document.querySelector("#time_bar").style.backgroundColor = (backgroundBlack) ? "#fff" : x.item.color[1]
    document.querySelector("#time_bar").style.borderColor = (backgroundBlack) ? "#fff" : x.item.color[1]

    try { document.querySelector("#like").classList.remove(!x.item.like ? "fas" : "far") } catch (error) { }


    document.querySelector("#like").classList.add(x.item.like ? "fas" : "far")
}
function TimeBar(x, y) {
    document.querySelector("#time_bar").style.width = ((x / y) * 100) + "%"
    document.querySelector('#progress_ms').innerText = convertMS(x)
    document.querySelector('#duration_ms').innerText = convertMS(y)
}

async function refreshToken() {
    await $.ajax({
        url: '/refresh_token',
        data: {
            'refresh_token': window.t
        }
    }).done(function (data) {
        access_token = data.access_token
        console.log(`Spotify API - Acess Token: \n%c${access_token}`, 'color: orange;')
    });
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




if (window.screen.width < 600 || window.screen.height < 600) {
    displayLoopTimer = setInterval(displayLoop, 5000)
    backgroundBlack = true
    displayLoop();
    document.getElementById("box").style.background = "transparent"
}



function displayLoop() {
    if (!displayStatus[0] || displayStatus[1]) {
        show("right")
        hide("left")
    } else if (displayStatus[0] || !displayStatus[1]) {
        show("left")
        hide("right")
    } else {
        show("right")
        hide("left")
    }


}


function show(y) {

    document.getElementById(y).style.width = "100vw";

    if (y == "right") {

        let textos = document.querySelectorAll("#right h1,#right p,#right i")
        document.getElementById("time_bar").style.opacity = 1

        textos.forEach((item) => {
            switch (item.tagName) {
                case "H1":
                    item.style.fontSize = "12vh"
                    break;

                case "P":
                    item.style.fontSize = "7vh"
                    break;

                case "I":
                    item.style.fontSize = "7vh"
                    break;

                default:
                    item.style.fontSize = "7vh"
                    break;
            }
        })
    }

    displayStatus[(y === "left") ? 1 : 0] = true
}
function hide(y) {

    document.getElementById(y).style.width = 0;

    if (y === "right") {
        let textos = document.querySelectorAll("#right h1,#right p,#right i")
        textos.forEach((item) => { item.style.fontSize = 0 })
        document.getElementById("time_bar").style.opacity = 0
    }

    displayStatus[(y === "left") ? 1 : 0] = false
}