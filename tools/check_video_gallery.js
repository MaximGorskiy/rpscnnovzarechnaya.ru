// Browser self-check: run on the locally loaded site before starting playback.
() => {
  const assert = (condition, message) => { if (!condition) throw Error(message); };
  const gallery = document.querySelector('#construction-videos');
  const videos = window.COMMUNITY_CONTENT.constructionVideos;
  const buttons = [...gallery.querySelectorAll('.video-thumbnail')];
  assert(!gallery.hidden && buttons.length === videos.length, 'Video thumbnails missing');
  assert(!gallery.querySelector('iframe'), 'YouTube loaded before playback was requested');
  buttons.forEach((button, index) => {
    button.click();
    assert(gallery.querySelector('.video-caption strong').textContent.includes(videos[index].title), 'Wrong title');
    assert(gallery.querySelector('.video-caption a').href.endsWith('v=' + videos[index].youtubeId), 'Wrong YouTube link');
    assert(gallery.querySelectorAll('[aria-pressed="true"]').length === 1, 'Selection is ambiguous');
    assert(gallery.querySelector('.video-poster img').src.startsWith('data:') || location.pathname === '/', 'Offline cover was not embedded');
    assert(!gallery.querySelector('iframe'), 'Selection started playback automatically');
  });
  buttons[0].click();
  assert(document.documentElement.scrollWidth <= innerWidth, 'Page overflows viewport');
  return `OK: ${buttons.length} videos, individual titles/links, selected thumbnail, no automatic playback or overflow`;
}
