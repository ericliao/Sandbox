window.onload = function() {
    // create the audio context (chrome only for now)
    if (! window.AudioContext) {
        if (! window.webkitAudioContext) {
            alert('no audiocontext found');
        }
        window.AudioContext = window.webkitAudioContext;
    }
    var context = new AudioContext();
    var audioBuffer;
    var analyser;
    var javascriptNode;

    // create a buffer source node
    getUserMedia(
    {
        "audio": {
            "mandatory": {
                "googEchoCancellation": "false",
                "googAutoGainControl": "false",
                "googNoiseSuppression": "false",
                "googHighpassFilter": "false"
            },
            "optional": []
        },
    }, gotStream);

    function error() {
        alert('Stream generation failed.');
    }

    function getUserMedia(dictionary, callback) {
        try {
            navigator.getUserMedia =
                navigator.getUserMedia ||
                navigator.webkitGetUserMedia ||
                navigator.mozGetUserMedia;
            navigator.getUserMedia(dictionary, callback, error);
        } catch (e) {
            alert('getUserMedia threw exception :' + e);
        }
    }

    function gotStream(stream) {
        // setup a javascript node
        javascriptNode = context.createScriptProcessor(2048, 1, 1);

        // connect to destination, else it isn't called
        javascriptNode.connect(context.destination);

        // setup a analyzer
        analyser = context.createAnalyser();
        analyser.smoothingTimeConstant = 0.3;
        analyser.fftSize = 256;

        // Create an AudioNode from the stream.
        mediaStreamSource = context.createMediaStreamSource(stream);

        // Connect it to the analyzer.
        mediaStreamSource.connect(analyser);

        // connect the analyser to the javascriptnode
        // we use the javascript node to draw at a
        // specific interval.
        analyser.connect(javascriptNode);

        renderScene(javascriptNode, analyser);
    }

    // log if an error occurs
    function onError(e) {
        console.log(e);
    }
};