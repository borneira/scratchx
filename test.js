(function(ext) {

    sauron_ve_movimiento = false;
    dataversion = 0;
    loadtime = 0;

    switches = [];
    dimmers = [];
    wcovers = [];
    sensors = [];
    temp_sensors = [];
    light_sensors = [];

    mswitches = [];
    mdimmers = [];
    mwcovers =[];

    data = JSON.parse ($.ajax({
        url: 'http://192.168.1.112/port_3480/data_request?id=lu_sdata',
        async: false}).responseText);

    dataversion = data.dataversion;
    loadtime = data.loadtime;
    for (i = 0; i < data.devices.length; i++) {
        switch (data.devices[i].category) {
            case 2:
                dimmers.push(data.devices[i]);
                switches.push(data.devices[i]);
                break;
            case 3:
                switches.push(data.devices[i]);
                break;
            case 4:
                sensors.push(data.devices[i]);
                break;
            case 8:
                wcovers.push(data.devices[i]);
                break;
            case 17:
                temp_sensors.push(data.devices[i]);
                break;
            case 18:
                light_sensors.push(data.devices[i]);
                break;
        }
    }

    for (i=0;i < switches.length ; i++) {
        mswitches.push(switches[i].name);
    }

    for (i=0;i < dimmers.length ; i++) {
        mdimmers.push(dimmers[i].name);
    }

    for (i=0;i < wcovers.length ; i++) {
        mwcovers.push(wcovers[i].name);
    }
    var menu = new Object();
    menu.mswitches = mswitches;
    menu.mdimmers = mdimmers;
    menu.mwcovers = mwcovers;


    // Cleanup function when the extension is unloaded
    ext._shutdown = function() {};

    // Status reporting code
    // Use this to report missing hardware, plugin or unsupported browser
    ext._getStatus = function() {
        console.log("getStatus");
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


ext.set_alarm = function(time) {
       window.setTimeout(function() {
           alarm_went_off = true;
       }, time*1000);
    };

    ext.when_movimiento = function() {
       // Reset alarm_went_off if it is true, and return true
       // otherwise, return false.
       if (sauron_ve_movimiento === true) {
           sauron_ve_movimiento = false;
           return true;
       }

       return false;
    };
    ext.encender = function(devicename) {
        url = '';
        for (i=0;i<switches.length;i++) {
            if (switches[i].name==devicename) {
                url = 'http://192.168.1.112/port_3480/data_request?id=lu_action&DeviceNum=' + switches[i].id;
                url = url + '&serviceId=urn:upnp-org:serviceId:SwitchPower1&action=SetTarget&newTargetValue=1';
                break;
            }
        }
        if (url=='') return 0;
        $.ajax({url: url, async: false });
    };

    ext.apagar = function(devicename) {
        url = '';
        for (i=0;i<switches.length;i++) {
            if (switches[i].name==devicename) {
                url = 'http://192.168.1.112/port_3480/data_request?id=lu_action&DeviceNum=' + switches[i].id;
                url = url + '&serviceId=urn:upnp-org:serviceId:SwitchPower1&action=SetTarget&newTargetValue=0';
                break;
            }
        }
        if (url=='') return 0;
        $.ajax({url: url, async: false });
    };
    ext.ajustar = function(level, devicename) {
        url = '';
        for (i=0;i<dimmers.length;i++) {
            if (dimmers[i].name==devicename) {
                url = 'http://192.168.1.112/port_3480/data_request?id=lu_action&DeviceNum=' + dimmers[i].id;
                url = url + '&serviceId=urn:upnp-org:serviceId:Dimming1&action=SetLoadLevelTarget&newLoadlevelTarget=';
                url = url + level;
                break;
            }
        }
        if (url=='') return 0;
        $.ajax({url: url, async: false });
    };

    ext.subir = function(devicename) {
        url = '';
        for (i=0;i<wcovers.length;i++) {
            if (wcovers[i].name==devicename) {
                url = 'http://192.168.1.112/port_3480/data_request?id=lu_action&DeviceNum=' + wcovers[i].id;
                url = url + '&serviceId=urn:upnp-org:serviceId:WindowCovering1&action=Up';
                break;
            }
        }
        if (url=='') return 0;
        $.ajax({url: url, async: false });
    };
    ext.bajar = function(devicename) {
        url = '';
        for (i=0;i<wcovers.length;i++) {
            if (wcovers[i].name==devicename) {
                url = 'http://192.168.1.112/port_3480/data_request?id=lu_action&DeviceNum=' + wcovers[i].id;
                url = url + '&serviceId=urn:upnp-org:serviceId:WindowCovering1&action=Down';
                break;
            }
        }
        if (url=='') return 0;
        $.ajax({url: url, async: false });
    };

    // Block and block menu descriptions
    var descriptor = {
        blocks: [
            [' ', 'Encender %m.mswitches', 'encender'],
            [' ', 'Apagar %m.mswitches', 'apagar'],
            [' ', 'Ajustar a %n %m.mdimmers', 'ajustar', '100'],
            [' ', 'Subir %m.mwcovers', 'subir'],
            [' ', 'Bajar %m.mwcovers', 'bajar'],
            ['R', 'Luz SAURON', 'get_luz'],
            ['h', 'Cuando SAURON detecte movimiento', 'when_movimiento']
        ]
    };
    descriptor.menus = menu;

    // Register the extension
    ScratchExtensions.register('Weather extension', descriptor, ext);
})({});
