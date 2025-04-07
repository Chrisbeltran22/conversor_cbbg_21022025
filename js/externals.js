const requestNotificationPermission = async () => {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
        throw new Error("No se ha podido otorgar permisos para la notification");
    } else {
        new Notification("Hola, mi nombre es Christopher Bryan Beltran Gonzalez, soy estudiante de la Universidad Francisco Gavidia.");
    }
}



async function recordVideo() {
    if (window.recorder && window.recorder.state === "recording") {
        window.recorder.stop();
    } else {
        let toggle = document.getElementById("recording-button");

        let stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true }).catch((error) => {
            throw new Error("No es posible continuar, debido a que no se han brindado permisos a la aplicacion");
        });


        let videoE1 = document.getElementById("video-element");
        videoE1.srcObject = stream;
        videoE1.play();

        window.recorder = new MediaRecorder(stream);

        let chunks = [];
        window.recorder.ondataavailable = function (event) {
            if (event.data.size > 0) {
                chunks.push(event.data);
            }
        };

        window.recorder.onstop = function () {
            let blob = new Blob(chunks, { type: 'video.mp4' });
            toggle.innerHTML = `<i class="fa fa-circle"></i>`;
            videoE1.srcObject = null;
            videoE1.src = URL.createObjectURL(blob);
            let tracks = stream.getTracks();
            tracks.forEach(track => track.stop());
        }

        window.recorder.onstart = function () {
            toggle.innerHTML = `<i class="fa fa-square"></i>`;

        };

        window.recorder.start();
    }
}

function geolocalizacion() {
    if (navigator.permissions && navigator.permissions.query) {
        navigator.permissions.query({ name: 'geolocation' }).then(function (result) {
            const permission = result.state;
            if (permission == 'granted' || permission === 'prompt') {
                _onGetCurrentLocation();
            }
        });
    } else if (navigator.geolocation) {
        _onGetCurrentLocation();
    }
}

function _onGetCurrentLocation() {
    const options = {
        enableHighAcccuracy: true,
        timeout: 5000,
        maximumAge: 0
    };
    navigator.geolocation.getCurrentPosition(function (position) {
        const marker = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        };
        let enlace = document.getElementById("ir_mapa");
        enlace.href = 'https://www.google.com/? q=${marker.lat}, ${marker.lng}'; enlace.text = "IR AL MAPA"
        enlace.target = "_blank";
    }, function (error) {
        console.log(error);
    }, options);
}

const init = () => {
    const tieneSoporteUserMedia = () =>
        !!(navigator.mediaDevices.getUserMedia);

    if (typeof Window.MediaRecorder === "undefined" || !tieneSoporteUserMedia()) {
        return alert("Su Navegador No cumple Los Requisitos, Por Favor Actualice a un Navegador mas reciente");
    }

    const $listaDeDispositivos = document.querySelector("#listaDeDispositvos"),
        $duracion = document.querySelector("#duracion"),
        $btnComenzarGrabacion = document.querySelector("#btnComenzarGrabacion"),
        $btnDetenerGrabacion = document.querySelector("#btnDetenerGrabacion");


    const limpiarSelect = () => {
        for (let x = $listaDeDispositivos.options.length - 1; x >= 0; x--) {
            $listaDeDispositivos.options.remove(x);
        }
    }

    const segundosATiempo = numeroDeSegundos => {
        let horas = Math.floor(numeroDeSegundos / 60 / 60);
        numeroDeSegundos -= horas * 60 * 60;

        let minutos = Math.floor(numeroDeSegundos / 60);
        numeroDeSegundos -= minutos * 60;

        numeroDeSegundos = parseInt(numeroDeSegundos);
        if (horas < 10) horas = "0" + horas;
        if (minutos < 10) minutos = "0" + minutos;
        if (numeroDeSegundos < 10) numeroDeSegundos = "0" + numeroDeSegundos;

        return `${horas}:${minutos}:${numeroDeSegundos}`;
    };

    let tiempoInicio, MediaRecorder, idIntervalo;
    const refrescar = () => {
        $duracion.textContent = segundosATiempo((Date.now() - tiempoInicio) / 1000);
    }

    const llenarLista = () => {
        navigator.mediaDevices.enumerateDevices().then(dispositivos => {
            limpiarSelect();
            dispositivos.forEach((dispositivos, indice) => {
                if (dispositivos.kind === "audioinput") {
                    const $opcion = document.createElement("option");
                    $opcion.text = dispositivos.label || `Dispositivo ${indice + 1}`;
                    $opcion.value = dispositivos.deviceId;
                    $listaDeDispositivos.appendChild($opcion);
                }
            })
        })
    };

    const comenzarAContar = () => {
        tiempoInicio = Date.now();
        idIntervalo = setInterval(refrescar, 500);
    };

    const comenzaAGrabar = () => {
        if (!$listaDeDispositivos.options.length) return alert("No Hay Dispositivos");
        if (MediaRecorder) return alert("ya esta grabando");

        navigator.mediaDevices.getUserMedia({
            audio: {
                deviceId: $listaDeDispositivos.value,
            }
        }).then(stream => {
            MediaRecorder = new MediaRecorder(stream);
            MediaRecorder.start();
            comenzarAContar();
            const fragmentosDeAudio = [];
            MediaRecorder.addEventListener("dataavailable", evento => {
                fragmentosDeAudio.push(evento.data);
            });
            MediaRecorder.addEventListener("stop", () => {
                stream.getTracks().forEach(track => track.stop());
                detenerConteo();
                const blobAudio = new Blob(fragmentosDeAudio);
                const urlParaDescargar = URL.createObjectURL(blobAudio);
                let a = document.createElement("a");
                document.body.appendChild(a);
                a.style = "display:none";
                a.href = urlParaDescargar;
                a.download = "ChristopherBryanBeltranGonzalez.ufg.webm";
                a.click();
                window.URL.revokeObjectURL(urlParaDescargar);
            });
        }).catch(error => {
            console.log(error);
        });
    };
    const detenerConteo = () => {
        clearInterval(idIntervalo);
        tiempoInicio = null;
        $duracion.textContent = "";
    }

    const detenerGrabacion = () => {
        if (!MediaRecorder) return alert("No se está grabando");
        MediaRecorder.stop();
        MediaRecorder = null;
    }

    $btnComenzarGrabacion.addEventListener("click", comenzaAGrabar);
    $btnDetenerGrabacion.addEventListener("click", detenerGrabacion);

    llenarLista();
}
document.addEventListener("DOMContentLoaded", init);