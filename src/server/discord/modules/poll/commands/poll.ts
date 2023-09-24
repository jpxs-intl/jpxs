import SlashCommandBuilder from "../../../core/loaders/objects/customSlashCommandBuilder";
import PollModule from "..";

const Command = new SlashCommandBuilder()
  .setName("poll")
  .setDescription("Make a poll")
  .addStringOption((option) =>
    option  
        .setName("text")
        .setDescription("The text of the poll")
        .setRequired(true)
    )
    .addStringOption((option) =>
    option
        .setName("option1")
        .setDescription("The first option of the poll")
        .setRequired(true)
    )
    .addStringOption((option) =>
    option
        .setName("option2")
        .setDescription("The second option of the poll")
        .setRequired(true)
    )
    .addStringOption((option) =>
    option
        .setName("option3")
        .setDescription("The third option of the poll")
        .setRequired(false)
    )
    .addStringOption((option) =>
    option
        .setName("option4")
        .setDescription("The fourth option of the poll")
        .setRequired(false)
    )
    .addStringOption((option) =>
    option
        .setName("option5")
        .setDescription("The fifth option of the poll")
        .setRequired(false)
    )
    .addStringOption((option) =>
    option  
        .setName("option6")
        .setDescription("The sixth option of the poll")
        .setRequired(false)
    )
    .addStringOption((option) =>
    option
        .setName("option7")
        .setDescription("The seventh option of the poll")
        .setRequired(false)
    )
    .addStringOption((option) =>
    option  
        .setName("option8")
        .setDescription("The eighth option of the poll")
        .setRequired(false)
    )
  .setFunction(async (interaction) => {
    
    const text = interaction.options.getString("text", true);

    const option1 = interaction.options.getString("option1", true);
    const option2 = interaction.options.getString("option2", true);
    const option3 = interaction.options.getString("option3");
    const option4 = interaction.options.getString("option4");
    const option5 = interaction.options.getString("option5");
    const option6 = interaction.options.getString("option6");
    const option7 = interaction.options.getString("option7");
    const option8 = interaction.options.getString("option8");
    
    const options = [option1, option2, option3, option4, option5, option6, option7, option8].filter((option) => option !== null);

    await PollModule.getPollModule().createPoll(text, options as string[], interaction.channel as any);

    await interaction.reply({
        content: "Poll created!",
        ephemeral: true,
    });


  });

export default Command;