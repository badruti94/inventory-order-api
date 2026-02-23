import amqp from 'amqplib';

const rabbitmqHost = process.env.RABBITMQ_HOST ?? 'rabbitmq';

async function startConsumer() {
    const connection = await amqp.connect(`amqp://${rabbitmqHost}`);
    const channel = await connection.createChannel();

    await channel.assertExchange('order.exchange', 'direct', { durable: true });
    const q = await channel.assertQueue('order.created.queue', { durable: true });
    await channel.bindQueue(q.queue, 'order.exchange', 'order.created');

    channel.consume(q.queue, async (msg) => {
        if (!msg) return;

        const data = JSON.parse(msg.content.toString());
        console.log('Processing order:', data);

        // Simulasi email / invoice
        await new Promise(r => setTimeout(r, 1000));

        channel.ack(msg);
    });
}

startConsumer();