import amqp from 'amqplib';
import logger from './logger.js';
import env from './env.js';

let channel;

export async function initRabbit() {
    const connection = await amqp.connect(`amqp://${env.rabbitmqHost}`);
    channel = await connection.createChannel();
    await channel.assertExchange('order.exchange', 'direct', {durable: true});

    logger.info('RabbitMQ connected');
}

export function getChannel() {
    if (!channel) throw new Error('RabbitMQ not initialized');
    return channel;
}