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
