import { store } from '../store'





//    var state_SSE = new EventSource('http://localhost:5000/status/all');
//    state_SSE.onmessage = function (event) {
//        var obj = JSON.parse(event.data);
//        var keys = Object.keys(obj);
//
//        if (obj["mnt-1"] && obj["mnt-1"]["mnt-1"] != "empty") {
//
//            
//
//
//
//
//            $.extend(state_mnt1, obj["mnt-1"]);
//            var telescope_action = 'unknown';
//            if (state_mnt1.mnt1_connected == 'no') {
//                telescope_action = 'disconnected';
//            }
//            if (state_mnt1.mnt1_connected == 'yes') {
//                telescope_action = 'connected';
//            }
//            if (state_mnt1.parked == 'no') {
//                telescope_action = 'unparked';
//            }
//            if (state_mnt1.parked == 'yes') {
//                telescope_action = 'parked';
//            }
//            if (state_mnt1.tracking == 'yes') {
//                telescope_action = 'tracking';
//            }
//            if (state_mnt1.slewing == 'yes') {
//                telescope_action = 'slewing';
//            }
//
//            $('#state-ra').text(parseFloat(state_mnt1.ra).toFixed(2));
//            $('#state-de').text(parseFloat(state_mnt1.dec).toFixed(2));
//            $('#state-telescope').text(telescope_action);
//            $('#state-alt').text(parseFloat(state_mnt1.alt).toFixed(3) + '\u00B0');
//            $('#state-az').text(parseFloat(state_mnt1.az).toFixed(3) + '\u00B0');
//            $('#state-enclosure').text(state_mnt1.enclosure_status);
//            $('#state-lmst').text(parseFloat(state_mnt1.tel_sid_time).toFixed(3));
//        }
//    }
//