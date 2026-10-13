const shareBtn = document.getElementById('shareBtn');
const shareBtnText = document.getElementById('shareBtnText');
const liveVideo = document.getElementById('liveVideo');
const previewPlaceholder = document.getElementById('previewPlaceholder');
const liveStats = document.getElementById('liveStats');
const streamTimer = document.getElementById('streamTimer');
const bitrateIndicator = document.getElementById('bitrateIndicator');

const presetSelect = document.getElementById('presetSelect');
const resolutionSelect = document.getElementById('resolutionSelect');
const bandwidthSelect = document.getElementById('bandwidthSelect');
const fpsSelect = document.getElementById('fpsSelect');

let mediaStream = null;
let timerInterval = null;
let secondsElapsed = 0;

// Ajusta configurações automáticas ao trocar o Preset
presetSelect.addEventListener('change', (e) => {
    const val = e.target.value;
    if (val === 'high') {
        resolutionSelect.value = '1080';
        bandwidthSelect.value = 'high';
        fpsSelect.value = '60';
        showToast('Preset Alta Qualidade aplicado!');
    } else if (val === 'eco') {
        resolutionSelect.value = '720';
        bandwidthSelect.value = 'low';
        fpsSelect.value = '30';
        showToast('Preset Economia aplicado!');
    } else {
        showToast('Modo Manual ativado.');
    }
});

// Ação de iniciar/parar compartilhamento de tela
shareBtn.addEventListener('click', async () => {
    if (!mediaStream) {
        try {
            const constraints = {
                video: {
                    width: { ideal: parseInt(resolutionSelect.value) === 1080 ? 1920 : 1280 },
                    frameRate: { ideal: parseInt(fpsSelect.value) }
                },
                audio: true
            };

            mediaStream = await navigator.mediaDevices.getDisplayMedia(constraints);
            
            liveVideo.srcObject = mediaStream;
            liveVideo.style.display = 'block';
            previewPlaceholder.style.display = 'none';
            liveStats.style.display = 'flex';

            shareBtn.classList.add('active-stream');
            shareBtnText.textContent = 'Parar transmissão';
            showToast('Transmissão iniciada com sucesso!');

            startTimer();

            // Detecta quando o usuário clica em "Parar compartilhamento" nativo do navegador
            mediaStream.getVideoTracks()[0].onended = () => {
                stopTransmission();
            };

        } catch (err) {
            console.error(err);
            showToast('Compartilhamento cancelado ou não permitido.');
        }
    } else {
        stopTransmission();
        showToast('Transmissão encerrada.');
    }
});

function stopTransmission() {
    if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        mediaStream = null;
    }

    liveVideo.srcObject = null;
    liveVideo.style.display = 'none';
    previewPlaceholder.style.display = 'block';
    liveStats.style.display = 'none';

    shareBtn.classList.remove('active-stream');
    shareBtnText.textContent = 'Selecionar tela';

    stopTimer();
}

function startTimer() {
    secondsElapsed = 0;
    updateTimerDisplay();
    timerInterval = setInterval(() => {
        secondsElapsed++;
        updateTimerDisplay();
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
    secondsElapsed = 0;
}

function updateTimerDisplay() {
    const hrs = Math.floor(secondsElapsed / 3600).toString().padStart(2, '0');
    const mins = Math.floor((secondsElapsed % 3600) / 60).toString().padStart(2, '0');
    const secs = (secondsElapsed % 60).toString().padStart(2, '0');
    streamTimer.textContent = `${hrs}:${mins}:${secs}`;
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
