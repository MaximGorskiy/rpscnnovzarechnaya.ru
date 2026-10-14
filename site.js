(() => {
  'use strict';
  const data = window.COMMUNITY_CONTENT || {};
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
  if(data.constructionPhotos?.length){const container=document.querySelector('#construction-photos');container.className='gallery construction-gallery';container.replaceChildren();data.constructionPhotos.forEach(photo=>{if(!/^assets\/[a-zA-Z0-9_./-]+\.(webp|jpe?g|png)$/i.test(photo.src)||photo.src.includes('..'))return;const figure=make('figure');const a=make('a','','gallery-item');a.href=photo.src;a.dataset.gallery='';const img=make('img');img.src=photo.src;img.alt=photo.caption;img.loading='lazy';a.append(img,make('span',`${dateLabel(photo.date)} · ${photo.caption}`));figure.append(a);container.append(figure);});}
  if(data.scheduleText)document.querySelector('#schedule-text').textContent=data.scheduleText;
  if(data.donationText)document.querySelector('#donation-details').textContent=data.donationText;
  if(!data.scheduleText)document.querySelector('#schedule-text').prepend(make('span','НУЖНО ЗАПОЛНИТЬ: МЕСТО И РАСПИСАНИЕ','field-placeholder'));
  if(!data.donationText)document.querySelector('#donation-details').prepend(make('span','НУЖНО ЗАПОЛНИТЬ: РЕКВИЗИТЫ И ПОЛУЧАТЕЛЬ','field-placeholder'));
  if(!data.constructionPhotos?.length)document.querySelector('#construction-photos div').prepend(make('span','НУЖНО ДОБАВИТЬ: ФОТОГРАФИИ СТРОИТЕЛЬСТВА','field-placeholder'));
  const contacts=document.querySelector('#contact-details');
  if(!data.phone&&!data.email)contacts.prepend(make('span','НУЖНО ЗАПОЛНИТЬ: ТЕЛЕФОН, EMAIL И КОНТАКТНОЕ ЛИЦО','field-placeholder'));
  if(data.phone||data.email||data.contactPerson){contacts.replaceChildren();contacts.append(make('p',data.contactPerson||'НУЖНО ЗАПОЛНИТЬ: КОНТАКТНОЕ ЛИЦО',data.contactPerson?'':'field-placeholder'));if(data.phone){const a=make('a',data.phone,'contact-link');a.href='tel:'+data.phone.replace(/[^+\d]/g,'');contacts.append(a);}if(data.email&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)){const a=make('a',data.email,'contact-link');a.href='mailto:'+data.email;contacts.append(a);}contacts.append(make('p','Посещение строительной площадки — по предварительному согласованию.','small'));}
  const dialog=document.querySelector('#lightbox');
  document.querySelectorAll('[data-gallery]').forEach(link=>link.addEventListener('click',event=>{if(typeof dialog.showModal!=='function')return;event.preventDefault();dialog.querySelector('img').src=link.href;dialog.querySelector('img').alt=link.querySelector('img').alt;dialog.querySelector('p').textContent=link.querySelector('span').textContent;dialog.showModal();}));
  dialog.querySelector('button').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
  document.querySelector('.share-button').addEventListener('click',async()=>{const result=document.querySelector('#share-result');const url=location.protocol==='file:'?'https://rpscnnovzarechnaya.ru/':location.origin+location.pathname;try{if(navigator.share&&location.protocol!=='file:'){await navigator.share({title:document.title,url});}else if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(url);result.textContent='Ссылка скопирована';}else{result.textContent=`Ссылка: ${url}`;}}catch(error){if(error.name!=='AbortError')result.textContent=`Ссылка: ${url}`;}});
})();
