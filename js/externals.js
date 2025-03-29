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
            if (event.data.size <= 0) {
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
