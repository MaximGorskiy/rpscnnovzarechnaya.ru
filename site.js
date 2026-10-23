(() => {
  'use strict';
  const data = window.COMMUNITY_CONTENT || {};
  const asset = value => (window.COMMUNITY_ASSETS || {})[value] || value;
  const make = (tag, text, className) => { const el = document.createElement(tag); if (text) el.textContent = text; if (className) el.className = className; return el; };
  const dateLabel = value => /^\d{4}-\d{2}-\d{2}$/.test(value || '') ? new Date(`${value}T12:00:00`).toLocaleDateString('ru-RU', {day:'numeric', month:'long', year:'numeric'}) : value || '';
  const menu = document.querySelector('.menu-toggle');
  menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(open)); document.querySelector('#navigation').classList.toggle('open', open); });
  document.querySelectorAll('#navigation a').forEach(a => a.addEventListener('click', () => {menu.setAttribute('aria-expanded','false'); document.querySelector('#navigation').classList.remove('open');}));
  if (data.constructionSummary) document.querySelector('#construction-summary').textContent = data.constructionSummary;
  const facts = document.querySelector('#construction-facts');
  [['Текущий этап',data.currentStage], ['Следующие работы',data.nextStage], ['Сведения обновлены',dateLabel(data.updatedAt)]].forEach(([label,value]) => {facts.append(make('dt',label),make('dd',value || 'НУЖНО ЗАПОЛНИТЬ',value ? '' : 'field-placeholder'));});
  const journal = document.querySelector('#journal');
  journal.replaceChildren();
  if (!data.reports?.length) { const entry = make('article', '', 'journal-entry'); entry.append(make('p','НУЖНО ДОБАВИТЬ: ДАТА И ОТЧЁТ','field-placeholder'),make('h3','Готовим первую запись с площадки'),make('p','Здесь будет датированный отчёт: что выполнено, что происходит сейчас и какие работы предстоят.')); journal.append(entry); }
  (data.reports || []).slice().sort((a,b) => b.date.localeCompare(a.date)).forEach(report => { const entry=make('article','','journal-entry'); const time=make('time',dateLabel(report.date),'eyebrow'); time.dateTime=report.date; entry.append(time,make('h3',report.title),make('p',report.text)); if(report.completed?.length){const ul=make('ul'); report.completed.forEach(item=>ul.append(make('li',item)));entry.append(ul);}journal.append(entry); });
  const projectEntry=make('article','','journal-entry');projectEntry.append(make('p','2024 · Архитектурный проект','eyebrow'),make('h3','Образ будущего храма'),make('p','Архитектурные визуализации и чертежи помогают представить храм на Берёзовской. Посмотрите проект и основные показатели.')); const projectLink=make('a','Посмотреть проект →','text-link');projectLink.href='#project';projectEntry.append(projectLink);journal.append(projectEntry);
  const photos=(data.constructionPhotos||[]).filter(photo=>/^assets\/[a-zA-Z0-9_./-]+\.(webp|jpe?g|png)$/i.test(photo.src)&&!photo.src.includes('..'));
  if(photos.length){
    const container=document.querySelector('#construction-photos');
    container.className='construction-gallery';
    container.replaceChildren(make('h3','Фотолетопись строительства'));
    const controls=make('div','','photo-strip-controls');
    const previous=make('button','←','photo-strip-arrow');
    const next=make('button','→','photo-strip-arrow');
    [previous,next].forEach(button=>{button.type='button';button.setAttribute('aria-controls','construction-thumbnails');});
    previous.setAttribute('aria-label','Прокрутить миниатюры влево');
    next.setAttribute('aria-label','Прокрутить миниатюры вправо');
    const counter=make('span','','photo-counter');counter.setAttribute('aria-live','polite');
    controls.append(previous,counter,next);
    const strip=make('div','','photo-strip');strip.id='construction-thumbnails';
    strip.setAttribute('role','group');strip.setAttribute('aria-label','Фотографии строительства');
    const figure=make('figure','','construction-selected');
    const link=make('a','','construction-selected-link');link.dataset.gallery='';link.dataset.fullscreen='true';
    const image=make('img');image.decoding='async';
    const hint=make('span','Открыть на весь экран ↗','photo-open-hint');link.append(image,hint);
    const caption=make('figcaption');caption.id='construction-photo-caption';caption.setAttribute('aria-live','polite');
    link.setAttribute('aria-describedby',caption.id);figure.append(link,caption);
    const motion=()=>matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth';
    const buttons=photos.map((photo,index)=>{
      const button=make('button','','photo-thumbnail');button.type='button';
      button.setAttribute('aria-label',`Фото ${index+1}: ${photo.caption||'Строительство храма'}`);
      const thumb=make('img');thumb.src=asset(photo.src);thumb.alt='';thumb.loading='lazy';thumb.decoding='async';
      button.append(thumb);button.addEventListener('click',()=>select(index));strip.append(button);return button;
    });
    let selected=0;
    function select(index){
      selected=index;const photo=photos[index];
      link.href=asset(photo.src);link.dataset.caption=[dateLabel(photo.date),photo.caption].filter(Boolean).join(' · ');
      image.src=asset(photo.src);image.alt=photo.caption||'Строительство храма';
      caption.textContent=link.dataset.caption;counter.textContent=`${index+1} / ${photos.length}`;
      link.setAttribute('aria-label','Открыть выбранную фотографию на весь экран');
      buttons.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));
      if(strip.isConnected)buttons[index].scrollIntoView({block:'nearest',inline:'nearest',behavior:motion()});
    }
    function updateArrows(){
      previous.disabled=strip.scrollLeft<=5;
      next.disabled=strip.scrollLeft+strip.clientWidth>=strip.scrollWidth-5;
    }
    previous.addEventListener('click',()=>strip.scrollBy({left:-Math.max(150,strip.clientWidth*.75),behavior:motion()}));
    next.addEventListener('click',()=>strip.scrollBy({left:Math.max(150,strip.clientWidth*.75),behavior:motion()}));
    strip.addEventListener('scroll',updateArrows,{passive:true});
    strip.addEventListener('keydown',event=>{
      if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
      event.preventDefault();const index=event.key==='Home'?0:event.key==='End'?photos.length-1:
        Math.max(0,Math.min(photos.length-1,selected+(event.key==='ArrowRight'?1:-1)));
      select(index);buttons[index].focus({preventScroll:true});
    });
    // Select before attaching the strip so initial rendering never moves the page.
    select(0);container.append(controls,strip,figure);updateArrows();
    if(typeof ResizeObserver==='function')new ResizeObserver(updateArrows).observe(strip);
    else window.addEventListener('resize',updateArrows);
  }
  const videos=(data.constructionVideos||[]).filter(video=>/^[a-zA-Z0-9_-]{11}$/.test(video.youtubeId)&&/^assets\/[a-zA-Z0-9_./-]+\.(webp|jpe?g|png)$/i.test(video.cover)&&!video.cover.includes('..'));
  if(videos.length){
    const container=document.querySelector('#construction-videos');container.hidden=false;container.className='construction-gallery video-gallery';
    container.append(make('h3','Видеолетопись строительства'));
    const controls=make('div','','photo-strip-controls');
    const previous=make('button','←','photo-strip-arrow'),next=make('button','→','photo-strip-arrow');
    previous.type=next.type='button';previous.setAttribute('aria-label','Прокрутить видео влево');next.setAttribute('aria-label','Прокрутить видео вправо');
    const counter=make('span','','photo-counter');counter.setAttribute('aria-live','polite');controls.append(previous,counter,next);
    const strip=make('div','','photo-strip');strip.id='construction-video-thumbnails';strip.setAttribute('role','group');strip.setAttribute('aria-label','Видеоролики строительства');
    [previous,next].forEach(button=>button.setAttribute('aria-controls',strip.id));
    const figure=make('figure','','construction-selected');
    const player=make('div','','video-player');
    const caption=make('figcaption','','video-caption');caption.setAttribute('aria-live','polite');
    const title=make('strong'),description=make('p'),watch=make('a','Открыть на YouTube ↗','text-link');watch.target='_blank';watch.rel='noopener noreferrer';
    caption.append(title,description,watch);figure.append(player,caption);
    let selected=0;
    const buttons=videos.map((video,index)=>{
      const button=make('button','','photo-thumbnail video-thumbnail');button.type='button';button.setAttribute('aria-label',`Видео ${index+1}: ${video.title}`);
      const image=make('img');image.src=asset(video.cover);image.alt='';image.loading='lazy';
      const play=make('span','▶','video-thumb-play');play.setAttribute('aria-hidden','true');button.append(image,play);
      button.addEventListener('click',()=>select(index));strip.append(button);return button;
    });
    function select(index){
      selected=index;const video=videos[index];const url='https://www.youtube.com/watch?v='+video.youtubeId;
      const button=make('button','','video-poster');button.type='button';button.setAttribute('aria-label','Смотреть видео: '+video.title);
      const image=make('img');image.src=asset(video.cover);image.alt=video.title;
      button.append(image,make('span','▶ Смотреть видео','video-play-label'));player.replaceChildren(button);
      title.textContent=[dateLabel(video.date),video.title].filter(Boolean).join(' · ');description.textContent=video.description||'';watch.href=url;
      counter.textContent=`${index+1} / ${videos.length}`;buttons.forEach((item,i)=>item.setAttribute('aria-pressed',String(i===index)));
      button.addEventListener('click',()=>{
        if(location.protocol==='file:'){window.open(url,'_blank','noopener,noreferrer');return;}
        const iframe=make('iframe');iframe.src='https://www.youtube-nocookie.com/embed/'+video.youtubeId+'?autoplay=1&rel=0';
        iframe.title=video.title;iframe.allow='accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen';iframe.allowFullscreen=true;
        iframe.referrerPolicy='strict-origin-when-cross-origin';player.replaceChildren(iframe);
      });
      if(strip.isConnected)buttons[index].scrollIntoView({block:'nearest',inline:'nearest',behavior:'auto'});
    }
    function updateArrows(){previous.disabled=strip.scrollLeft<=5;next.disabled=strip.scrollLeft+strip.clientWidth>=strip.scrollWidth-5;}
    const scroll=direction=>strip.scrollBy({left:direction*Math.max(150,strip.clientWidth*.75),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
    previous.addEventListener('click',()=>scroll(-1));next.addEventListener('click',()=>scroll(1));strip.addEventListener('scroll',updateArrows,{passive:true});
    strip.addEventListener('keydown',event=>{
      if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();
      const index=event.key==='Home'?0:event.key==='End'?videos.length-1:Math.max(0,Math.min(videos.length-1,selected+(event.key==='ArrowRight'?1:-1)));
      select(index);buttons[index].focus({preventScroll:true});
    });
    select(0);container.append(controls,strip,figure,make('p','Для просмотра видео требуется интернет. В копии, открытой с диска, ролик откроется на YouTube.','small'));
    updateArrows();if(typeof ResizeObserver==='function')new ResizeObserver(updateArrows).observe(strip);else window.addEventListener('resize',updateArrows);
  }
  if(data.scheduleText)document.querySelector('#schedule-text').textContent=data.scheduleText;
  const donation=document.querySelector('#donation-details');
  const hasDonation=Array.isArray(data.donationDetails)&&data.donationDetails.length>0;
  if(hasDonation){const details=make('details','','donation-disclosure');details.append(make('summary','Реквизиты для пожертвований'));const dl=make('dl','','bank-details');data.donationDetails.forEach(([label,value])=>dl.append(make('dt',label),make('dd',value)));details.append(dl);if(data.donationText)details.append(make('p',data.donationText));donation.replaceChildren(details);}
  else if(data.donationText)donation.textContent=data.donationText;
  if(!data.scheduleText)document.querySelector('#schedule-text').prepend(make('span','НУЖНО ЗАПОЛНИТЬ: МЕСТО И РАСПИСАНИЕ','field-placeholder'));
  if(!hasDonation&&!data.donationText)donation.prepend(make('span','НУЖНО ЗАПОЛНИТЬ: РЕКВИЗИТЫ И ПОЛУЧАТЕЛЬ','field-placeholder'));
  if(!photos.length)document.querySelector('#construction-photos div').prepend(make('span','НУЖНО ДОБАВИТЬ: ФОТОГРАФИИ СТРОИТЕЛЬСТВА','field-placeholder'));
  const contacts=document.querySelector('#contact-details');
  if(!data.phone&&!data.email)contacts.prepend(make('span','НУЖНО ЗАПОЛНИТЬ: ТЕЛЕФОН, EMAIL И КОНТАКТНОЕ ЛИЦО','field-placeholder'));
  if(data.phone||data.email||data.contactPerson){contacts.replaceChildren();contacts.append(make('p',data.contactPerson||'НУЖНО ЗАПОЛНИТЬ: КОНТАКТНОЕ ЛИЦО',data.contactPerson?'':'field-placeholder'));if(data.phone){const a=make('a',data.phone,'contact-link');a.href='tel:'+data.phone.replace(/[^+\d]/g,'');contacts.append(a);}if(data.email&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)){const a=make('a',data.email,'contact-link');a.href='mailto:'+data.email;contacts.append(a);}contacts.append(make('p','Посещение строительной площадки — по предварительному согласованию.','small'));}
  const dialog=document.querySelector('#lightbox');
  let nativeFullscreen=false;
  document.querySelectorAll('[data-gallery]').forEach(link=>link.addEventListener('click',async event=>{
    if(typeof dialog.showModal!=='function')return;
    event.preventDefault();
    dialog.querySelector('img').src=link.href;dialog.querySelector('img').alt=link.querySelector('img').alt;
    dialog.querySelector('p').textContent=link.dataset.caption||link.querySelector('span').textContent;
    const fullscreen=link.dataset.fullscreen==='true';dialog.classList.toggle('photo-fullscreen',fullscreen);
    dialog.showModal();
    if(fullscreen&&dialog.requestFullscreen){try{await dialog.requestFullscreen();nativeFullscreen=document.fullscreenElement===dialog;}catch(error){/* Full viewport overlay remains available. */}}
  }));
  dialog.querySelector('button').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
  dialog.addEventListener('close',()=>{
    nativeFullscreen=false;
    if(document.fullscreenElement===dialog)document.exitFullscreen().catch(()=>{});
  });
  document.addEventListener('fullscreenchange',()=>{
    if(nativeFullscreen&&document.fullscreenElement!==dialog){nativeFullscreen=false;if(dialog.open)dialog.close();}
  });
  document.querySelector('.share-button').addEventListener('click',async()=>{const result=document.querySelector('#share-result');const url=location.protocol==='file:'?'https://rpscnnovzarechnaya.ru/':location.origin+location.pathname;try{if(navigator.share&&location.protocol!=='file:'){await navigator.share({title:document.title,url});}else if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(url);result.textContent='Ссылка скопирована';}else{result.textContent=`Ссылка: ${url}`;}}catch(error){if(error.name!=='AbortError')result.textContent=`Ссылка: ${url}`;}});
})();
