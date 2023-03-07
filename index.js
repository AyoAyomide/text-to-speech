// Imports the Google Cloud client library
const textToSpeech = require('@google-cloud/text-to-speech');
const fs = require('fs');
const util = require('util');
const writeFile = util.promisify(fs.writeFile);// Creates a client

class TextToSpeech {
    constructor(text) {
        this.client = new textToSpeech.TextToSpeechClient();
        this.text = text;
        this.voice = {
            languageCode: 'en-US',
            ssmlGender: 'FEMALE',
            name: "en-US-Neural2-F"
        };
        this.audioConfig = {
            audioEncoding: "LINEAR16",
            effectsProfileId: ["small-bluetooth-speaker-class-device"],
            pitch: 0,
            speakingRate: 1
        };
    }

    async getSynthesize(text, voice, audioConfig) {
        const request = {
            input: { text },
            voice,
            audioConfig,
        };
        return await this.client.synthesizeSpeech(request);
    }

    async audioFile(filename) {
        const [response] = await this.getSynthesize(this.text, this.voice, this.audioConfig);
        await writeFile(filename, response.audioContent, 'binary');
        await this.ffmpegCompress(filename);
        console.log('Audio content written to file: ' + filename);
    }

    async ffmpegCompress(filename) {
        const { exec } = require('child_process');
        exec(`ffmpeg -i ${filename} -acodec libmp3lame -ab 64k _${filename}`, (err, stdout, stderr) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log(stdout);
        });
    }

};

const text = "In a not-so-distant future, humans have made incredible strides in artificial intelligence. Machines can now learn, reason, and make decisions on their own. They've become an integral part of society, making our lives easier and more convenient. But with this power comes great responsibility.";


new TextToSpeech(text).audioFile('output.mp3');
