
// verificacion_bot.js - Bot de Discord para verificación estilo Chile Centro Roleplay

const { Client, GatewayIntentBits, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, Events, PermissionsBitField } = require('discord.js');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages
    ]
});

// IDs a configurar por el dueño del servidor
const CONFIG = {
    canalComando: '1367633190394658918', // Canal donde se puede usar c!verificacion
    canalAltosMandos: '1371347655149617233', // Canal donde llegan las verificaciones
    rolVerificado: '1367633183692296280', // Rol que se agrega si es aceptado
    rolNoVerificado: '1367633183692296281', // Rol que se quita si es aceptado
    rolesAdmin: ['1371361089681494146', '1371360562792890368'] // Solo estos roles pueden usar el comando c!verificacion
};

client.on('messageCreate', async (message) => {
    if (!message.content.startsWith('c!verificacion')) return;
    if (message.channel.id !== CONFIG.canalComando) return;
    if (!message.member.roles.cache.some(r => CONFIG.rolesAdmin.includes(r.id))) {
        return message.reply('❌ No tienes permisos para usar este comando.');
    }

    const embedInicio = new EmbedBuilder()
        .setTitle('📋 Verificación - Chile Centro Roleplay')
        .setDescription('Presiona el botón para iniciar tu proceso de verificación.')
        .setColor('Green')
        .setFooter({ text: 'Chile Centro Roleplay' });

    const botonIniciar = new ButtonBuilder()
        .setCustomId('iniciar_verificacion')
        .setLabel('Iniciar verificación')
        .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder().addComponents(botonIniciar);
    await message.channel.send({ embeds: [embedInicio], components: [row] });
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'iniciar_verificacion') {
        const modal = new ModalBuilder()
            .setCustomId('formulario_verificacion')
            .setTitle('Formulario de Verificación');

        const campos = [
            { id: 'nombre_discord', label: 'Nombre de Discord', style: TextInputStyle.Short },
            { id: 'nombre_roblox', label: 'Nombre de Roblox', style: TextInputStyle.Short },
            { id: 'mg', label: '¿Qué significa MG?', style: TextInputStyle.Short },
            { id: 'pg', label: '¿Qué significa PG?', style: TextInputStyle.Short },
            { id: 'foto', label: '📸 Foto de tu personaje en Roblox (link)', style: TextInputStyle.Short },
            { id: 'quien_invito', label: '¿Quién te invitó o cómo nos conociste?', style: TextInputStyle.Paragraph },
            { id: 'conceptos', label: '¿Conoces los conceptos de rol y reglas?', style: TextInputStyle.Short },
            { id: 'pk', label: '¿Qué es PK (Player Kill)?', style: TextInputStyle.Short },
            { id: 'rk', label: '¿Qué es RK (Revenge Kill)?', style: TextInputStyle.Short },
            { id: 'leiste_reglas', label: '¿Has leído las reglas?', style: TextInputStyle.Short },
            { id: 'actividad', label: '¿Vas a estar activo y participar?', style: TextInputStyle.Short }
        ];

        const filas = campos.map(campo =>
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId(campo.id)
                    .setLabel(campo.label)
                    .setStyle(campo.style)
                    .setRequired(true)
            )
        );

        modal.addComponents(filas.slice(0, 5));
        modal.addComponents(filas.slice(5, 10));
        modal.addComponents(filas.slice(10, 11));
        await interaction.showModal(modal);
    }

    if (interaction.isModalSubmit() && interaction.customId === 'formulario_verificacion') {
        const datos = {};
        interaction.fields.fields.forEach((field, key) => {
            datos[key] = field.value;
        });

        const embedVerificacion = new EmbedBuilder()
            .setTitle('🔎 Nueva solicitud de verificación')
            .setDescription(`Solicitud enviada por <@${interaction.user.id}>`)
            .setThumbnail(interaction.user.displayAvatarURL())
            .addFields(
                { name: 'Nombre Discord', value: datos['nombre_discord'], inline: true },
                { name: 'Nombre Roblox', value: datos['nombre_roblox'], inline: true },
                { name: 'MG', value: datos['mg'], inline: true },
                { name: 'PG', value: datos['pg'], inline: true },
                { name: 'Foto Personaje', value: datos['foto'], inline: false },
                { name: '¿Quién invitó?', value: datos['quien_invito'], inline: false },
                { name: 'Conoce conceptos', value: datos['conceptos'], inline: true },
                { name: 'PK', value: datos['pk'], inline: true },
                { name: 'RK', value: datos['rk'], inline: true },
                { name: 'Leídas reglas', value: datos['leiste_reglas'], inline: true },
                { name: 'Actividad', value: datos['actividad'], inline: true }
            )
            .setColor('Blue')
            .setFooter({ text: 'Chile Centro Roleplay' });

        const botones = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`aceptar_${interaction.user.id}_${datos['nombre_roblox']}`)
                .setLabel('✅ Aceptar')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId(`denegar_${interaction.user.id}`)
                .setLabel('❌ Denegar')
                .setStyle(ButtonStyle.Danger)
        );

        const canalAltos = await client.channels.fetch(CONFIG.canalAltosMandos);
        await canalAltos.send({ embeds: [embedVerificacion], components: [botones] });

        await interaction.reply({ content: '✅ Tu solicitud fue enviada a los administradores.', ephemeral: true });
    }

    // Manejo de aceptar o denegar
    if (interaction.customId.startsWith('aceptar_')) {
        const [, userId, robloxName] = interaction.customId.split('_');
        const miembro = await interaction.guild.members.fetch(userId).catch(() => null);
        if (!miembro) return interaction.reply({ content: '❌ Usuario no encontrado.', ephemeral: true });

        await miembro.roles.remove(CONFIG.rolNoVerificado);
        await miembro.roles.add(CONFIG.rolVerificado);
        await miembro.setNickname(`${miembro.displayName} (${robloxName})`);

        await interaction.reply({ content: `✅ Usuario aceptado y rol asignado a <@${userId}>.`, ephemeral: true });
        await miembro.send('✅ ¡Has sido verificado exitosamente en Chile Centro Roleplay!');
    }

    if (interaction.customId.startsWith('denegar_')) {
        const [, userId] = interaction.customId.split('_');
        const miembro = await interaction.guild.members.fetch(userId).catch(() => null);
        if (!miembro) return interaction.reply({ content: '❌ Usuario no encontrado.', ephemeral: true });

        await interaction.reply({ content: `❌ Verificación denegada para <@${userId}>.`, ephemeral: true });
        await miembro.send('❌ Tu solicitud de verificación fue denegada en Chile Centro Roleplay.');
    }
});

client.login('MTM3NTczMjAxNDQ1NTU5MDkxMg.Gb1iHG.hL2fygWtkSeZKhlVqSdUMgVijNi_S2WF5TgejM');
