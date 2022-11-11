import * as dotenv from 'dotenv'
import { REST, Routes, Client, GatewayIntentBits, Interaction, CommandInteraction, Guild, TextBasedChannel } from 'discord.js'
import Image from './Image'
import db from './db'
dotenv.config()

const commands = [
  {
    name: "gallery",
    description: "Generates a gallery from this channel"
  }
]

const update_commands = async (commands: any) => {
  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN as string)
  try {
    console.log('Refreshing commands');
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID as string), { body: commands })
    console.log('Refreshed commands');
  } catch (err) {
    console.error(err);
  }
}

const gallery = async (interaction: CommandInteraction) => {
  const guild = interaction.guild
  const channel = interaction.channel as TextBasedChannel
  const messages = await channel.messages.fetch({ limit: 100 })
  const images: Image[] = []
  messages.forEach(m => {
    m.attachments.filter(a => a.contentType?.startsWith('image')).forEach(a => {
      images.push({
        message: m.id,
        url: a.url,
        type: a.contentType ?? "unknown",
        author: m.author.id,
        date: m.createdTimestamp
      })
    })
  })
  console.log(images);
  await db.add_images(guild?.id as string, channel.id, images)
  interaction.reply(`Done!`)
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
})

client.on('ready', async () => {
  console.log(`Logged in as ${client?.user?.tag}`);
})

client.on('interactionCreate', async (interaction: Interaction) => {
  if (!interaction.isCommand()) return
  switch (interaction.commandName) {
    case 'gallery':
      await gallery(interaction)
      break
    default:
      break
  }
})

update_commands(commands)

client.login(process.env.TOKEN)