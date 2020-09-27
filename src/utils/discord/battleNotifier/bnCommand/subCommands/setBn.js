const { emojis, keywords } = require('../config');
const { bnBattleTypes, bnBattleAttributes } = require('../../constants');
const { parser, formatter, isUserConfigEmpty } = require('../../userConfig');

const userConfigParser = parser({
  bnBattleTypes,
  bnBattleAttributes,
  keywords,
});
const userConfigFormatter = formatter({ keywords });

const notesMessage = `*Note:*
*Use the word* ***any*** *to indicate "Any battle types" or "Any designers".*
*Use the word* ***ignore*** *at the beginning of a line to ignore (blacklist) that specific rule.*`;

const firstConfigMessage = `Please reply to this message to set your configuration. Write one line per "rule" like this:

Normal, Flag Tag *by* Pab, Markku, Sla
First Finish *by* any
Ignore any *by* Grob

*This example reads like:*
*1. Let me know when a Normal or Flag Tag battle is started by Pab, Markku or Sla.*
*2. Let me know when a First Finish battle is started by anyone.*
*3. Ignore when Grob starts a battle (even First Finish).*

${notesMessage}
`;

const editMessage = 'Please reply to edit your configuration, your current is:';
const yourConfigMessage = 'Your configuration was saved as:';

const getEditMessage = userConfig => {
  const configString = userConfigFormatter.toString(userConfig);
  return `${editMessage}\n\n${configString}\n\n${notesMessage}`;
};

const setConfigErrorMessage =
  'Could not use your reply to configure, please try again.';

const sendRequestMessage = async ({ message, store }) => {
  const currentConfig = await store.get(message.author.id);
  const redirectMessage = currentConfig
    ? getEditMessage(currentConfig)
    : firstConfigMessage;
  return message.send(redirectMessage);
};

const setBn = async ({ message, store }) => {
  const { channel } = await sendRequestMessage({ message, store });

  const user = message.author;
  const userMessage = await channel.readUserMessage(user);
  const userConfig = userConfigParser.parse(userMessage.content);

  if (!isUserConfigEmpty(userConfig)) {
    userConfig.username = user.username;
    await store.set(user.id, userConfig);

    const configString = userConfigFormatter.toString(userConfig);
    channel.send(`${yourConfigMessage}\n\n${configString}`);
    userMessage.react(emojis.ok);
  } else {
    channel.send(setConfigErrorMessage);
    userMessage.react(emojis.error);
  }
};

module.exports = setBn;
module.exports.messages = {
  firstConfigMessage,
  notesMessage,
  editMessage,
  yourConfigMessage,
  setConfigErrorMessage,
};
