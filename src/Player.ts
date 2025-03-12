import { workspace } from "vscode";
import * as Speaker from "speaker";
import * as fs from "fs";
import Volume = require("pcm-volume");
import { spawn } from "child_process";

const playQueue: Array<string> = new Array<string>();
let isPlaying: boolean = false;

function play(file: string): void {
	isPlaying = true;

	if (process.platform === "win32") {
		const speaker = new Speaker({
			channels: 2,
			bitDepth: 16,
			sampleRate: 44100,
			final: donePlaying
		});
		const v = new Volume();
		const voiceVolume = workspace
			.getConfiguration("hotheadedVSCode")
			.get<number>("voiceVolume") as number;
		v.setVolume(voiceVolume);

		v.pipe(speaker);
		fs.createReadStream(file).pipe(v);
	} else {
		const child = spawn("mplayer", [file]);
		child.on("close", donePlaying);
	}
}
function donePlaying(): void {
	isPlaying = false;

	const nextFile = playQueue.shift();
	if (nextFile !== undefined) {
		play(nextFile);
	}
}

export function addToPlayQueue(file: string): void {
	if (!isPlaying) {
		play(file);
	}
	else {
		playQueue.push(file);
	}
}