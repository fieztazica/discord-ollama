import { Message, SendableChannels } from 'discord.js'
import { ChatResponse, Ollama } from 'ollama'
import {
    ChatParams,
    UserMessage,
    streamResponse,
    blockResponse,
} from './index.js'
import { Queue } from '../queues/queue.js'
import { AbortableAsyncIterator } from 'ollama/src/utils.js'
import { availableFunctions } from './handlers/tools/index.js'

/**
 * Method to send replies as normal text on discord like any other user
 * @param message message sent by the user
 * @param model name of model to run query
 * @param msgHist message history between user and model
 */
export async function normalMessage(
    message: Message,
    ollama: Ollama,
    model: string,
    msgHist: Queue<UserMessage>,
    stream: boolean = false
): Promise<string> {
    // bot's respnse
    let response: ChatResponse
    let result: string = ''
    let useTools: boolean = false
    const channel = message.channel as SendableChannels

    await channel
        .send('Generating Response . . .')
        .then(async (sentMessage) => {
            try {
                let params: ChatParams = {
                    model: model,
                    ollama: ollama,
                    msgHist: msgHist.getItems(),
                }

                // run query based on stream preference, true = stream, false = block
                // if (stream) {
                //     let messageBlock: Message = sentMessage
                //     response = await streamResponse(params) // THIS WILL BE SLOW due to discord limits!
                //     for await (const portion of response) {
                //         // check if over discord message limit
                //         if (result.length + portion.message.content.length > 2000) {
                //             result = portion.message.content

                //             // new message block, wait for it to send and assign new block to respond.
                //             await channel.send("Creating new stream block...").then(sentMessage => { messageBlock = sentMessage })
                //         } else {
                //             result += portion.message.content

                //             // ensure block is not empty
                //             if (result.length > 5)
                //                 messageBlock.edit(result)
                //         }
                //         console.log(result)
                //     }
                // }
                // else {
                response = await blockResponse(params)

                if (response.message.tool_calls) {
                    for (const tool of response.message.tool_calls) {
                        const functionToCall =
                            availableFunctions[tool.function.name]
                        const functionResponse = functionToCall(
                            tool.function.arguments
                        )
                        console.log(
                            response.message.tool_calls,
                            tool.function.arguments,
                            functionResponse
                        )
                        // if queue is full, remove the oldest message
                        while (msgHist.size() >= msgHist.capacity)
                            msgHist.dequeue()
                        // Add function response to the conversation
                        // successful query, save it in context history
                        msgHist.enqueue({
                            role: 'tool',
                            content: functionResponse,
                            images: [],
                        })

                        useTools = true
                    }
                }

                if (useTools) {
                    params = {
                        model: model,
                        ollama: ollama,
                        msgHist: msgHist.getItems(),
                    }
                    response = await blockResponse(params)
                }

                result = response.message.content

                // check if message length > discord max for normal messages
                if (result.length > 2000) {
                    sentMessage.edit(result.slice(0, 2000))
                    result = result.slice(2000)

                    // handle for rest of message that is >2000
                    while (result.length > 2000) {
                        channel.send(result.slice(0, 2000))
                        result = result.slice(2000)
                    }

                    // last part of message
                    channel.send(result)
                } // edit the 'generic' response to new message since <2000
                else sentMessage.edit(result)
                // }
            } catch (error: any) {
                console.log(
                    `[Util: messageNormal] Error creating message: ${error.message}`
                )
                sentMessage.edit(
                    `**Response generation failed.**\n\nReason: ${error.message}`
                )
            }
        })

    // return the string representation of ollama query response
    return result
}
