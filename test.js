(function(ext) {
    // Cleanup function when the extension is unloaded
    ext._shutdown = function() {};

    // Status reporting code
    // Use this to report missing hardware, plugin or unsupported browser
    ext._getStatus = function() {
        return {status: 2, msg: 'Ready'};
    };

    ext.get_luz = function(ya) {
        // Make an AJAX call to the Open Weather Maps API
        $.ajax({
              url: 'http://192.168.1.112/port_3480/data_request?id=lu_sdata',
              async: false,
              success: function( data ) {
                  // Got the data - parse it and return the temperature
                  //dataParsed = $.parseJSON(data);
                  luz = data.devices[14].light;
                  ya (luz);
              },
        });
    };

ext.set_pecera_on = function() {
    $.ajax({
              url: 'http://192.168.1.112/port_3480/data_request?id=lu_action&DeviceNum=19&serviceId=urn:upnp-org:serviceId:SwitchPower1&action=SetTarget&newTargetValue=1',
              async: false
};

ext.set_pecera_off = function() {
    $.ajax({
              url: 'http://192.168.1.112/port_3480/data_request?id=lu_action&DeviceNum=19&serviceId=urn:upnp-org:serviceId:SwitchPower1&action=SetTarget&newTargetValue=0',
              async: false
};
ext.set_alarm = function(time) {
       window.setTimeout(function() {
           alarm_went_off = true;
       }, time*1000);
    };

    ext.when_alarm = function() {
       // Reset alarm_went_off if it is true, and return true
       // otherwise, return false.
       if (alarm_went_off === true) {
           alarm_went_off = false;
           return true;
       }

       return false;
    };
    // Block and block menu descriptions
    var descriptor = {
        blocks: [
            [' ', 'Encender Luz Pecera', set_pecera_on],
            [' ', 'Apagar Luz Pecera', set_pecera_off],
            ['R', 'Luz SAURON', 'get_luz'],
            ['', 'run alarm after %n seconds', 'set_alarm', '2'],
            ['h', 'when alarm goes off', 'when_alarm'],
        ]
    };

    // Register the extension
    ScratchExtensions.register('Weather extension', descriptor, ext);
})({});
