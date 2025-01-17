import fetch from 'node-fetch';
import { Defaults } from './types/defaults';
import { Util } from './utils';

export class Dispatch {
    private host: string;
    private defaults: Defaults;

    constructor(config: { Host: string, Defaults: Defaults }) {
        this.host = config.Host,
            this.defaults = config.Defaults
    }
    
    async get(path?: string) {
        const timeouts = [250, 250, 250, 500, 1000, 2000, 4000, 8000];
        let timeout = 0;

        while (true) {
            const response = await fetch(`${this.host}${path}`, { method: 'GET', headers: this.defaults.headers })
            if (response.status === 200) {
                return await response.json() as object;
            }

            // 429 = too many requests (overload), use exponential retries
            if (response.status === 429 && timeout < timeouts.length) {
                await Util.delay(timeouts[timeout]);
                timeout += 1;
                continue;
            }

            throw await Util.makeErrorFromResponse(response)
        }
    }

    async post(path: string, body: any) {
        const response = await fetch(`${this.host}${path}`, { method: 'POST', headers: this.defaults.headers, body: JSON.stringify(body, null, 4) });
        if (response.status === 201)
            return await response.json() as object;
        throw await Util.makeErrorFromResponse(response);
    }

    async put(path: string, body?: any) {
        const response = await fetch(`${this.host}${path}`, { method: 'PUT', headers: this.defaults.headers, body: body && JSON.stringify(body, null, 4) });
        if (response.status === 200)
            return await response.json() as object;
        throw await Util.makeErrorFromResponse(response);
    }

    async delete(path: string) {
        const response = await fetch(`${this.host}${path}`, { method: 'DELETE', headers: this.defaults.headers });
        if (response && response.status === 204)
            return response.ok;
        throw await Util.makeErrorFromResponse(response);
    }
}