import Discord from 'discord.js';
import config from '../config';

const client = new Discord.Client();

export function discord() {
  client.once('ready', () => {
    client.user.setPresence({
      status: 'online',
      game: {
        name: 'Elma Online',
        type: 'WATCHING',
        url: config.discord.url,
      },
    });
  });
  if (config.discord.token) {
    client.login(config.discord.token);
  }
}

export function sendMessage(channel, message) {
  if (config.discord.token) {
    client.channels.get(channel).send(message);
  }
}

const alignPlacement = no => {
  if (no < 10) {
    return ` ${no}`;
  }
  return no;
};

const alignKuski = kuski => {
  let trailingSpaces = 16 - kuski.length;
  let alignedKuski = kuski;
  while (trailingSpaces > 0) {
    alignedKuski += ' ';
    trailingSpaces -= 1;
  }
  return alignedKuski;
};

const alignTime = time => {
  let leadingSpaces = 8 - time.length;
  let alignedTime = time;
  while (leadingSpaces > 0) {
    alignedTime = ` ${alignedTime}`;
    leadingSpaces -= 1;
  }
  return alignedTime;
};

export function discordChatline(content) {
  sendMessage(
    config.discord.channels.battle,
    `(${content.kuski}): ${content.chatline}`,
  );
}

export function discordBesttime(content) {
  if (!content.battleIndex) {
    sendMessage(
      config.discord.channels.times,
      `${content.level}.lev: ${content.time} by ${content.kuski} (${
        content.position
      }.)`,
    );
  }
}

export function discordBestmultitime(content) {
  if (!content.battleIndex) {
    sendMessage(
      config.discord.channels.times,
      `${content.level}.lev: ${content.time} (M) by ${content.kuski1} & ${
        content.kuski2
      } (${content.position}.)`,
    );
  }
}

export function discordBattlestart(content) {
  let battletype = '';
  if (content.battleType !== 'normal') {
    battletype = `${content.battleType
      .toLowerCase()
      .replace(/(^| )(\w)/g, s => s.toUpperCase())} `;
  }
  let text = `${config.discord.icons.started} **${battletype}Battle in`;
  text += ` ${content.level}.lev started by ${content.designer},`;
  text += ` ${content.durationMinutes} mins**\n`;
  text += `More info <${config.discord.url}battles/${content.battleIndex}>`;
  sendMessage(config.discord.channels.battle, text);
}

export function discordBattlequeue(content) {
  let text = `${config.discord.icons.queue} **Queue:`;
  content.queue.map(q => {
    text += ` ${q.durationMinutes} mins ${q.battleType} by ${q.designer},`;
    return q;
  });
  text = text.substring(0, text.length - 1);
  text += '**';
  sendMessage(config.discord.channels.battle, text);
}

export function discordBattleEnd(content) {
  if (content.aborted) {
    let battletype = '';
    if (content.battleType !== 'normal') {
      battletype = `${content.battleType
        .toLowerCase()
        .replace(/(^| )(\w)/g, s => s.toUpperCase())} `;
    }
    let text = `${config.discord.icons.ended} **`;
    text += `${battletype}Battle in ${content.level}.lev aborted**`;
    sendMessage(config.discord.channels.battle, text);
  }
}

export function discordBattleresults(content) {
  let battletype = '';
  if (content.battleType !== 'normal') {
    battletype = `${content.battleType
      .toLowerCase()
      .replace(/(^| )(\w)/g, s => s.toUpperCase())} `;
  }
  let text = `${config.discord.icons.results} **`;
  text += `${battletype}Battle in ${content.level}.lev`;
  text += ` by ${content.designer} over**\n`;
  text += `More info: <${config.discord.url}/battles/${content.battleIndex}>`;
  text += '```\n';
  content.results.map(r => {
    text += `${alignPlacement(r.position)}. `;
    text += `${alignKuski(r.kuski)} ${alignTime(r.time)}\n`;
    return r;
  });
  text += '```\n';
  sendMessage(config.discord.channels.battle, text);
}