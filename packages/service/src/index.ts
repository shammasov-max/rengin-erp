import {
    config,
    loadConfig,
} from '@app-config/main';
import './fastify-with-plugins';
import service from './rest';

// you're best off initializing config ASAP in your program
async function main() {
    await loadConfig();

    console.log({config: config.WRITE_PG});
    console.log({config});

    await service();
}

console.time('startup');
main()
    .catch(e => console.error('Service Error', e))
    .then(() => console.timeEnd('startup'));

process.on('unhandledRejection', r => {
    console.error('Unhandled Rejection', r);
});

process.on('uncaughtException', r => {
    console.error('Unhandled error', r);
});
 