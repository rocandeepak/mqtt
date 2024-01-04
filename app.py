from flask import Flask, render_template
import paho.mqtt.client as mqtt
import re

app = Flask(__name__)

broker_host = "192.168.70.13"
broker_port = 1883
topic = "SRMV-DEV006/IN/ULT:00004"

mqtt_client = mqtt.Client()

def on_message_ultrasonic_sensor(client, userdata, msg):
    print("Received a new value:", msg.payload.decode('utf-8'))
    mqtt_message = msg.payload.decode('utf-8')
    distance_list = mqtt_message.split(":")
    distance = int(re.search(r'\d+', distance_list[3]).group()) if len(distance_list) > 3 else 0

    # Implement motor control logic here
    if distance < 10:
        # Control dc motor based on distance
        # ...

mqtt_client.on_message = on_message_ultrasonic_sensor
mqtt_client.connect(broker_host, broker_port)
mqtt_client.subscribe(topic)
mqtt_client.loop_start()

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)
