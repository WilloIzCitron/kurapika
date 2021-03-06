const { ClientUtil } = require('discord-akairo');
const { MessageEmbed } = require('discord.js');
const prettyMilliseconds = require('pretty-ms');
const axios = require('axios');
class KurapikaClientUtil extends ClientUtil {
	constructor(client) {
		super();

		this.client = client;
		this.getMember = this.getMember;
	}

	embed() {
		return new MessageEmbed().setColor('#99AAB5');
	}

	durationToMillis(dur) {
		return (
			dur
				.split(':')
				.map(Number)
				.reduce((acc, curr) => curr + acc * 60) * 1000
		);
	}

	millisToDuration(ms) {
		return prettyMilliseconds(ms, {
			colonNotation: true,
			secondsDecimalDigits: 0
		});
	}

	chunk(arr, size) {
		const temp = [];
		for (let i = 0; i < arr.length; i += size) {
			temp.push(arr.slice(i, i + size));
		}
		return temp;
	}

	isValidURL(url) {
		return /^https?:\/\/((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|((\d{1,3}\.){3}\d{1,3}))(:\d+)?(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(#[-a-z\d_]*)?$/i.test(
			url
		);
	}

	shuffleArray(arr) {
		for (let i = arr.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[arr[i], arr[j]] = [arr[j], arr[i]];
		}
		return arr;
	}

	async webhook(url, msg, opt = {}) {
		let { data: web } = await axios.get(url);

		if (!typeof opt === 'object')
			return Error('That arguments `opt` must be object');

		if (typeof msg === 'object') opt['embeds'] = [msg];
		else opt['content'] = msg;

		return axios.post(url, opt);
	}

	async getMember(message, toFind = '') {
		toFind = toFind.toLowerCase();

		let target = message.guild.members.cache.get(toFind);

		if (!toFind) {
			target = message.member;
		}

		if (!target && message.mentions.members)
			target = message.mentions.members.first();

		if (!target && toFind) {
			target = message.guild.members.cache.find(member => {
				return (
					member.displayName.toLowerCase().includes(toFind) ||
					member.user.tag.toLowerCase().includes(toFind)
				);
			});
		}

		if (!target) {
			return message.channel.send({
				embed: {
					description: 'User Not Found',
					color: 'RED'
				}
			});
		}

		return target;
	}

	getChannel(msg, channel) {
		let result;
		let guildChannel;

		if (channel.startsWith('<#')) {
			result = /<#(\d+)>/gi.exec(channel)[1];
			guildChannel = msg.guild.channels.cache.get(result);
		} else {
			result = channel;

			guildChannel = msg.guild.channels.cache.find(x => x.name.includes(result));
		}

		if (!guildChannel)
			return msg.channel.send({
				embed: {
					description: 'Channel Not Found',
					color: 'RED'
				}
			});

		return guildChannel;
	}
}

module.exports = KurapikaClientUtil;
