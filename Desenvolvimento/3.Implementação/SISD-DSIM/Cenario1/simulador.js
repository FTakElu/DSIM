const mqtt = require('mqtt');

// *IP DA EC2
const IP_EC2 = 'XXX.XXX.XXX.XXX'; 

const client = mqtt.connect(`mqtt://${IP_EC2}:1883`);

client.on('connect', () => {
    console.log('Simulador conectado à EC2!');
    
    setInterval(() => {
        const payload = JSON.stringify({
            batimentos: Math.floor(Math.random() * (100 - 60) + 60),
            oxigenacao: Math.floor(Math.random() * (100 - 90) + 90),
            temperatura: 36.5
        });
        client.publish('pulseira/dados', payload);
        console.log('Enviado:', payload);
    }, 2000); 
});