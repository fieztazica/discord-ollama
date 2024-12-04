import { event, Events } from '../utils/index.js'
import commands from '../commands/index.js'

/**
 * Interaction creation listener for the client
 * @param interaction the interaction received from the server
 */
export default event(
    Events.InteractionCreate,
    async ({ log, client }, interaction) => {
        if (interaction.isAutocomplete()) {
            log(
                `Autocomplete called \'${interaction.commandName}\' from ${interaction.user.tag}.`
            )

            // ensure command exists, otherwise kill event
            const command = commands.find(
                (command) => command.name === interaction.commandName
            )

            if (!command) return

            command.autocomplete?.(client, interaction)
        } else {
            if (!interaction.isCommand() || interaction.isChatInputCommand())
                return

            log(
                `Interaction called \'${interaction.commandName}\' from ${interaction.user.tag}.`
            )

            // ensure command exists, otherwise kill event
            const command = commands.find(
                (command) => command.name === interaction.commandName
            )
            if (!command) return

            command.run(client, interaction)
        }
    }
)
