"use strict";
var speech = {};
speech.commands = {};
speech.callbacks = {};
speech.commands.normal = {};
speech.commands.normal = {};
speech.help = {};
speech.private = {};

speech.speak = function(phrase) {
    try {
        var msg = new SpeechSynthesisUtterance(phrase);
        msg.lang = 'en-US';
        window.speechSynthesis.speak(msg);
    } catch (e) {
        console.log("SPEECH SYNTEHSIS ERROR :", e);
        return;
    }
}

speech.init = function() {
    // first we make sure annyang started succesfully
    if (typeof annyang === "undefined" || !annyang) {
        $('#unsupported').fadeIn('fast');
        console.log("?!")
        return;
    };

    // Init cmd callbacks
    speech.initCmdCallbacks();

    // define the functions our commands will run.
    speech.initCmds();

    // Add commands
    annyang.addCommands(speech.commands.normal);

    // Init annyang callbacks
    speech.initAnnyangCallbacks();

    // OPTIONAL: activate debug mode for detailed logging in the console
    annyang.debug();

    // OPTIONAL: Set a language for speech recognition (defaults to English)
    // For a full list of language codes, see the documentation:
    // https://github.com/TalAter/annyang/blob/master/docs/README.md#languages
    annyang.setLanguage('en');

    // Start listening. You can call this here, or attach this call to an event, button, etc.
    annyang.start();
}

speech.initCmdCallbacks = function() {
    speech.callbacks.help = function() {
        speech.speak("Here are all available commands");
        pageCtrl.showAvailableCmds();
        return true;
    };
    speech.callbacks.flyTo = function(term) {
        console.log("Flying to", term)
        var loc = mapCtrl.availableLocations[term];
        if (!loc) {
            // Try using recognizer to find the location in recognized list
            var loc2 = recognizer.matchEntity(term, Object.keys(mapCtrl.availableLocations));
            if (!loc2) {
                // speech.speak("Unable to fly to " + term + ", unrecognized location");
                return false;
            } else {
                term = loc2;
            }
        }
        speech.speak("Flying to " + term);
        mapCtrl.flyTo(term);
        return true;
    };
    speech.callbacks.showLayer = function(term) {
        return speech.private.toggleLayer(term, true);
    };
    speech.callbacks.hideLayer = function(term) {
        return speech.private.toggleLayer(term, false);
    };
    speech.private.toggleLayer = function(term, bool) {
        var layer = mapCtrl.availableLayers[term];
        if (!layer) {
            // Try using recognizer to find the location in recognized list
            var layer2 = recognizer.matchEntity(term, Object.keys(mapCtrl.availableLayers));
            if (!layer2) {
                // speech.speak("Unable to toggle " + term + ", unrecognized layer");
                return false;
            } else {
                term = layer2;
            }
        }
        if (bool) {
            mapCtrl.showLayer(term);
            speech.speak("Showing layer " + term);
        } else {
            mapCtrl.hideLayer(term);
            speech.speak("Hiding layer " + term);
        }
        return true;
    }
    speech.callbacks.showAvailableLayers = function() {
        speech.speak("Showing Available Layers");
        pageCtrl.showAvailableLayers();
        return true;
    };
    speech.callbacks.hideAllLayers = function() {
        speech.speak("Hiding All Layers");
        mapCtrl.hideAllLayers();
        return true;
    };
    speech.callbacks.automaticOpacity = function() {
        speech.speak("Balancing layer opacities");
        mapCtrl.balanceLayerOpacities();
        return true;
    };
    speech.callbacks.switchTo2D = function() {
        speech.speak("Switching to 2D mode");
        mapCtrl.switchMode("2D");
        return true;
    };
    speech.callbacks.switchTo3D = function() {
        speech.speak("Switching to 3D mode");
        mapCtrl.switchMode("3D");
        return true;
    };
    speech.callbacks.zoomIn = function() {
        speech.speak("Zooming in");
        mapCtrl.zoomIn();
        return true;
    };
    speech.callbacks.zoomOut = function() {
        speech.speak("Zooming out");
        mapCtrl.zoomOut();
        return true;
    };
    speech.callbacks.pauseListening = function() {
        annyang.removeCommands();
        annyang.addCommands(speech.commands.paused);
        return true;
    };
    speech.callbacks.resumeListening = function() {
        annyang.removeCommands();
        annyang.addCommands(speech.commands.normal);
        return true;
    };
}

speech.initCmds = function() {
    speech.commands.normalSimplified = {
        "help": speech.callbacks.help,
        "show commands": speech.callbacks.help,
        "fly to *": speech.callbacks.flyTo,
        "fly me to *": speech.callbacks.flyTo,
        "show layer *": speech.callbacks.showLayer,
        "show me layer *": speech.callbacks.showLayer,
        "hide layer *": speech.callbacks.hideLayer,
        "show available layers": speech.callbacks.showAvailableLayers,
        "show me available layers": speech.callbacks.showAvailableLayers,
        "hide all layers": speech.callbacks.hideAllLayers,
        "automatic opacity": speech.callbacks.automaticOpacity,
        "2D": speech.callbacks.switchTo2D,
        "3D": speech.callbacks.switchTo3D,
        "zoom in": speech.callbacks.zoomIn,
        "zoom out": speech.callbacks.zoomOut,
        "stop listening": speech.callbacks.pauseListening,
        "pause listening": speech.callbacks.pauseListening,
    };
    speech.help.commands = [
        "help",
        "fly (me) to &#60;location&#62;",
        "show layer &#60;layer name&#62;",
        "hide layer &#60;layer name&#62;",
        "hide all layers",
        "show (me) available layers",
        "automatic opacity",
        "2D",
        "3D",
        "zoom &#60;in || out&#62;",
        "stop listening"
    ]
    speech.commands.normal = {
        "help": speech.callbacks.help,
        "show commands": speech.callbacks.help,
        "fly (me) to *term": speech.callbacks.flyTo,
        "show (me) layer *term": speech.callbacks.showLayer,
        "hide layer *term": speech.callbacks.hideLayer,
        "show (me) available layers": speech.callbacks.showAvailableLayers,
        "hide all layers": speech.callbacks.hideAllLayers,
        "automatic opacity": speech.callbacks.automaticOpacity,
        "2D": speech.callbacks.switchTo2D,
        "3D": speech.callbacks.switchTo3D,
        "zoom in": speech.callbacks.zoomIn,
        "zoom out": speech.callbacks.zoomOut,
        "hotword": {
            'regexp': /(stop|stop listening|pause|pause listening)/,
            'callback': speech.callbacks.pauseListening
        }
    };
    speech.commands.paused = {
        'hotword': {
            'regexp': /(start listening|listen|resume|resume listening)/,
            'callback': speech.callbacks.resumeListening
        }
    }
}

speech.initAnnyangCallbacks = function() {
    annyang.addCallback('start', function(possibles) {
        console.log("STARTING");
    });

    annyang.addCallback('error', function(possibles) {
        console.log("ERROR");
    });

    annyang.addCallback('end', function(possibles) {
        console.log("END");
    });

    annyang.addCallback('resultNoMatch', function(possibles) {
        console.log("RESULT MATCH");
    });
    annyang.addCallback('resultNoMatch', function(possibles) {
        console.log("non-matches", possibles);
        // Try using recognizer to resolve the non-match
        for (var i = 0; i < possibles.length; i++) {
            var result = recognizer.recognize(possibles[i], speech.commands.normalSimplified);
            if (result) {
                if (speech.commands.normalSimplified[result.rule](result.wildcardExtra)) {
                    return;
                };
            }
        }
        if (!result) {
            speech.speak("Unknown command");
        }

    });
}
