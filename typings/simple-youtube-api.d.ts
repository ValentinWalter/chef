//
// Created on Wed Jan 26 2021
//
// Copyright (c) Valentin Walter 2021
//

/* eslint-disable @typescript-eslint/ban-types */

// We have to declare the module ourselves because
// there unfortunately is no existing declaration file.

declare module "simple-youtube-api" {
	function parseURL(url: string): Object

	export default class YouTube {
		key?: string
		constructor(key: string | undefined)
		getChannel(url: string, options: Object = {}): Promise<?Channel>
		getChannelByID(id: string, options: Object = {}): Promise<?Channel>
		getPlaylist(url: string, options: Object = {}): Promise<?Playlist>
		getPlaylistByID(id: string, options: Object = {}): Promise<?Playlist>
		getVideo(url: string, options: Object = {}): Promise<?Video>
		getVideoByID(id: string, options: Object = {}): Promise<?Video>
		search(
			query: string,
			limit?: number,
			options: Object
		): Promise<Array<Video | Playlist | Channel | null>>
		searchPlaylists(
			query: string,
			limit?: number,
			options: Object = {}
		): Promise<Array<Playlist>>
		searchChannels(
			query: string,
			limit?: number,
			options: Object = {}
		): Promise<Array<Channel>>
		searchVideos(
			query: string,
			limit?: number,
			options: Object = {}
		): Promise<Array<Video>>
	}

	export class Video {
		channel: Channel
		description: string
		duration: DurationObject | null
		durationSeconds: number
		full: boolean
		id: string
		kind: string
		maxRes: Object
		publishedAt: Date
		raw: Object
		shortURL: string
		thumbnails: Object<"default", "medium", "high", "standard", "maxres">
		title: string
		type: string
		url: string
		youtube: YouTube
		constructor(youtube: YouTube, data: Object)
		static extractID(url: string): ?string
		fetch(options: Object = {}): Video
	}

	class Playlist {
		channel: Channel
		channelTitle?: string
		defaultLanguage?: string
		description?: string
		embedHTML: string
		id: string
		length: number
		localized?: Object
		privacy: string
		publishedAt?: Date
		thumbnails?: Object<string, Thumbnail>
		title?: string
		type: string
		url: string
		videos: Array<Video>
		youtube: YouTube
		constructor(youtube: YouTube, data: Object)
		static extractID(url): ?string
		fetch(options: Object = {}): Playlist
		getVideos(limit?, options?): Promise<Array<Video>>
	}

	class Channel {
		commentCount?: number
		country?: string
		customURL?: string
		defaultLanguage?: string
		description?: string
		full: boolean
		hiddenSubscriberCount?: boolean
		id: string
		kind: string
		localized?: Object
		publishedAt?: Date
		raw: Object
		relatedPlaylists?: Object
		subscriberCount?: number
		thumbnails?: Object<string, Thumbnail>
		title?: string
		type: string
		url: string
		videoCount?: number
		viewCount?: number
		youtube: YouTube
		constructor(youtube: YouTube, data: Object)
		static extractID(url: string): ?string
		fetch(options: Object = {}): Channel
	}

	type DurationObject = {
		hours?: number
		minutes?: number
		seconds?: number
	}

	type Thumbnail = {
		url: string
		width: number
		height: number
	}
}
