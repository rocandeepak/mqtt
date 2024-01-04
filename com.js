const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://192.168.70.13:1883');

function onMessageUltrasonicSensor(topic, message) {
    console.log(`Received a new value: ${message}`);
    const distanceList = message.split(":");
    const list = message.match(/\d+/);
    const distance = list ? parseInt(list[0]) : 0;

    if (distance < 10) {
        client.publish('SRMV-DEV084/OUT/LED:00013', 'OUT:LED:00013:N/A:ON');
        client.publish('SRMV-DEV072/OUT/MOT:00001', 'OUT:MOT:00001:N/A:0:REV');
        client.publish('SRMV-DEV042/OUT/SLN:00002', 'OUT:SLN:00002:N/A:OFF');
    } else {
        client.publish('SRMV-DEV084/OUT/LED:00013', 'OUT:LED:00013:N/A:OFF');
        client.publish('SRMV-DEV042/OUT/SLN:00002', 'OUT:SLN:00002:N/A:ON');
        client.publish('SRMV-DEV072/OUT/MOT:00001', 'OUT:MOT:00001:N/A:65:FWD');
    }
}

function onConnect() {
    console.log('Connected to MQTT broker');
    client.subscribe('SRMV-DEV006/IN/ULT:00004');
}

function onSubscribeDistance() {
    client.publish('SRMV-DEV006/BOOT', 'IN:ULT:00004:CM:STP');
    client.publish('SRMV-DEV072/BOOT', 'OUT:MOT:00001:N/A:STP');
    client.publish('SRMV-DEV084/BOOT', 'OUT:LED:00013:N/A:STP');
    client.publish('SRMV-DEV042/BOOT', 'IN:SLN:00002:N/A:STP');
}

function onPublishStpSuccess() {
    client.publish('SRMV-DEV006/BOOT', 'IN:ULT:00004:CM:STP');
    client.publish('SRMV-DEV072/BOOT', 'OUT:MOT:00001:N/A:SRT');
    client.publish('SRMV-DEV084/BOOT', 'OUT:LED:00013:N/A:SRT');
    client.publish('SRMV-DEV042/BOOT', 'IN:SLN:00002:N/A:SRT');
}

function onDisconnect() {
    console.log('Disconnected from MQTT broker');
}

client.on('connect', onConnect);
client.on('message', onMessageUltrasonicSensor);
client.on('subscribe', onSubscribeDistance);
client.on('publish', onPublishStpSuccess);
client.on('close', onDisconnect);
client.on('offline', onDisconnect);

process.on('SIGINT', function () {
    console.log('Stopping the motor...');
    client.publish('SRMV-DEV072/OUT/MOT:00001', 'OUT:MOT:00001:N/A:10:REV');
    process.exit(0);
});

// The script will run indefinitely unless interrupted by the user (Ctrl+C)
