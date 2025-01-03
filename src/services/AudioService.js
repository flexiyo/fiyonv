import audio from 'kaushal-react-native-track-player';

module.exports = async function () {
  audio.addEventListener('remote-play', async () => {
    await audio.play();
  });

  audio.addEventListener('remote-pause', async () => {
    await audio.pause();
  });

  audio.addEventListener('remote-next', async () => {
    await audio.skipToNext();
  });

  audio.addEventListener('remote-seek', async ({position}) => {
    await audio.seekTo(position);
  });
};
