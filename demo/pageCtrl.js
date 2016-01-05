var pageCtrl = {};

$(document).ready(function() {
    pageCtrl.init();
});

pageCtrl.init = function() {
    // Init map
    mapCtrl.initMap();

    // Init speech
    speech.init();
}

pageCtrl.showAvailableCmds = function() {
    var text = speech.help.commands.join("<br><br>");
    document.getElementById("textContainer").innerHTML = text;
}
pageCtrl.showAvailableLayers = function() {
    var text = Object.keys(mapCtrl.availableLayers).join("<br><br>");
    document.getElementById("textContainer").innerHTML = text;
}
