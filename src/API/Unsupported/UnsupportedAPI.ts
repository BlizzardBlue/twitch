import { Cacheable, Cached } from '../../Toolkit/Decorators';
import BaseAPI from '../BaseAPI';
import Channel from '../Channel/Channel';
import ChattersList, { ChattersListData } from './ChattersList';
import UserTools, { UserIdResolvable } from '../../Toolkit/UserTools';
import ChannelEvent, { ChannelEventData, ChannelEventAPIResult } from './ChannelEvent';
import { TwitchAPICallType } from '../../TwitchClient';

/**
 * Different API methods that are not officially supported by Twitch.
 *
 * Can be accessed using `client.unsupported` on a {@TwitchClient} instance.
 *
 * ## Example
 * ```ts
 * const client = new TwitchClient(options);
 * const cheermotes = await client.unsupported.getEvents('125328655');
 * ```
 */
@Cacheable
export default class UnsupportedAPI extends BaseAPI {
	/**
	 * Retrieves a list of chatters in the Twitch chat of the given channel.
	 *
	 * **WARNING**: In contrast to most other methods, this takes a channel *name*, not a user ID.
	 *
	 * @param channel The channel to retrieve the chatters for.
	 */
	@Cached(60)
	async getChatters(channel: string | Channel) {
		if (typeof channel !== 'string') {
			channel = channel.name;
		}

		const data: ChattersListData = await this._client.callAPI({
			url: `https://tmi.twitch.tv/group/user/${channel}/chatters`,
			type: TwitchAPICallType.Custom
		});
		return new ChattersList(data);
	}

	/**
	 * Retrieves a list of event planned for the given channel.
	 *
	 * @param channel The channel to retrieve the events for.
	 */
	@Cached(60)
	async getEvents(channel: UserIdResolvable) {
		const channelId = UserTools.getUserId(channel);
		const data = await this._client.callAPI<ChannelEventAPIResult>({ url: `channels/${channelId}/events` });
		return data.events.map((event: ChannelEventData) => new ChannelEvent(event, this._client));
	}
}
