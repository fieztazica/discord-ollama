import { getFlightTimes } from "./getFlightTimes.js";

export const tools = [
    {
        type: 'function',
        function: {
            name: 'get_flight_times',
            description: 'Get the flight times between two cities',
            parameters: {
                type: 'object',
                properties: {
                    departure: {
                        type: 'string',
                        description: 'The departure city (airport code)',
                    },
                    arrival: {
                        type: 'string',
                        description: 'The arrival city (airport code)',
                    },
                },
                required: ['departure', 'arrival'],
            },
        },
    },
]

export const availableFunctions: { [key: string]: any } = {
    get_flight_times: getFlightTimes,
};
