(function(ext) {

    dataversion = 0;
    loadtime = 0;
    timeout = 60;
    minimumdelay=1000;

    switches = [];
    dimmers = [];
    wcovers = [];
    sensors = [];
    temp_sensors = [];
    light_sensors = [];

    mswitches = [];
    mdimmers = [];
    mwcovers =[];
    msensors =[];

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

    for (i=0;i < sensors.length ; i++) {
        msensors.push(sensors[i].name);
    }

    var menu = new Object();
    menu.mswitches = mswitches;
    menu.mdimmers = mdimmers;
    menu.mwcovers = mwcovers;m
    menu.msensors = sensors;


    // Cleanup function when the extension is unloaded
    ext._shutdown = function() {};

    // Status reporting code
    // Use this to report missing hardware, plugin or unsupported browser
    ext._getStatus = function() {
        console.log("getStatus");
        url = 'http://192.168.1.112/port_3480/data_request?id=lu_sdata';
        url = url + '&loadtime=' + loadtime;
        url = url + '&dataversion=' +dataversion;
        url = url + '&timeout=' + timeout;
        url = url + '&minimumdelay=' + minimumdelay;

        data = JSON.parse ($.ajax({
            url: url,
            async: false}).responseText);

        for (i = 0; i < data.devices.length; i++) {
            switch (data.devices[i].category) {
                case 2:
                    break;
                case 3:
                    break;
                case 4:
                    for (j=0;j<sensors.length;j++) {
                        if (sensors[j].name==data.devices[i].name) break;
                    }
                    if (data.devices[i].tripped==1 && (data.devices[i].lasttripped > sensors[j].lasttripped)) {
                        sensors[j].lasttripped = data.devices[i].lasttripped;
                        sensors[j].tripped = 1;
                    }
                    break;
                case 8:
                    break;
                case 17:
                    break;
                case 18:
                    break;
            }
        }


        return {status: 2, msg: 'Ready'};
    };

    ext.detectar = function(devicename) {
        for (i=0;i<sensors.length;i++) {
            if (sensors[i].name == devicename) {
                if (sensors[i].tripped == 1) {
                    sensors[i].tripped = 0;
                    return true;
                }
            }
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
            ['h', 'Detectar %m.msensors', 'detectar']
        ]
    };
    descriptor.menus = menu;

    // Register the extension
    ScratchExtensions.register('Weather extension', descriptor, ext);
})({});
