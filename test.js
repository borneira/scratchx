(function(ext) {

    dataversion = 0;
    loadtime = 0;
    timeout = 60;
    minimumdelay=1000;

    comprobando_estado = false;

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
    menu.mwcovers = mwcovers;
    menu.msensors = msensors;

    menu.comparacion = ['>', '=', '<'];

    // Cleanup function when the extension is unloaded
    ext._shutdown = function() {};

    // Status reporting code
    // Use this to report missing hardware, plugin or unsupported browser
    ext._getStatus = function() {
        if (comprobando_estado) {
            console.log("getStatus");
            return {status: 2, msg: 'Ready'};
        }
        else {
            url = 'http://192.168.1.112/port_3480/data_request?id=lu_sdata';
            url = url + '&loadtime=' + loadtime;
            url = url + '&dataversion=' + dataversion;
            url = url + '&timeout=' + timeout;
            url = url + '&minimumdelay=' + minimumdelay;
            console.log("comprobando_estado true");
            comprobando_estado = true;
            $.ajax({
                url: url,
                success: function (data) {
                    console.log("Success" + data);
                    loadtime = data.loadtime;
                    dataversion = data.dataversion;
                    if (data.devices != null) {
                        for (i = 0; i < data.devices.length; i++) {
                            // Sensores
                            for (j = 0; j < sensors.length; j++) {
                                //Alarmas activadas
                                if (data.devices[i].id == sensors[j].id) {
                                    if ((data.devices[i].tripped == 1) && (data.devices[i].lasttrip > sensors[j].lasttrip)) {
                                        sensors[j].lasttrip = data.devices[i].lasttrip;
                                        sensors[j].tripped = 1;
                                    }
                                }
                            }
                            //Switchers
                            for (j = 0; j < switches.length; j++) {
                                //Cambios de estado
                                if (data.devices[i].id == switches[j].id) {
                                    if (data.devices[i].status != switches[j].status) {
                                        switches[j].status = data.devices[i].status;
                                        switches[j].cambio_estado = true;
                                    }
                                }
                            }
                            //Dimmers
                            for (j = 0; j < dimmers.length; j++) {
                                //Cambios de nivel
                                if (data.devices[i].id == dimmers[j].id) {
                                    if (data.devices[i].level != dimmers[j].level) {
                                        dimmers[j].level = data.devices[i].level;
                                        dimmers[j].cambio_nivel = true;
                                    }

                                }
                            }
                        }
                    }
                    console.log("comprobando_estado false - success");
                    comprobando_estado = false;
                },
                error: function () {
                    console.log("comprobando_estado false - error");
                    comprobando_estado = false;
                }
            });
            return {status: 2, msg: 'Ready'};
        }
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
    ext.cambio_estado = function(devicename, estado) {
        for (i = 0; i < switches.length; i++) {
            if (switches[i].name == devicename) {
                if (switches[i].cambio_estado) {
                    if (switches[i].estado == estado) {
                        return true;
                    }
                }
            }
        }
        return false;
    };
    ext.cambio_nivel = function (devicename, comparacion, nivel) {
        for (i = 0; i < dimmers.length; i++) {
            if (dimmers[i].name == devicename) {
                if (dimmers[i].cambio_nivel) {
                    switch (comparacion) {
                        case '>':
                            if (dimmers[i].level > level) return true;
                        case '=':
                            if (dimmers[i].level == level) return true;
                        case '<':
                            if (dimmers[i].level < level) return true;
                    }
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
            ['h', 'Detectar %m.msensors', 'detectar'],
            ['h', 'Cambio de estado %m.switches', 'cambio_estado'],
            ['h', 'Cambio nivel %m.dimmers % m.comparacion %n', 'cambio_nivel', '>', '0']
        ]
    };
    descriptor.menus = menu;

    // Register the extension
    ScratchExtensions.register('Vera extension', descriptor, ext);
})({});
