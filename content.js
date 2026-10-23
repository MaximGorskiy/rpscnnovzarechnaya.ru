/* Меняем данные локально. Публикуем только подтверждённые сведения.
   Для отчёта: {date: "2026-10-03", title: "...", text: "...", completed: ["..."]}
   Для фото: {src: "assets/building/photo.webp", date: "2026-10-03", caption: "..."}
   Контакты: phone, email. Пустые значения скрываются.
   Реквизиты: donationDetails — пары «поле, значение» из карточки общины.
   donationText — дополнительный подтверждённый текст, без HTML. */
window.COMMUNITY_CONTENT = {
  constructionSummary: "Храм на Берёзовской находится в строительстве. Подробный отчёт о текущем этапе и выполненных работах готовится к публикации.",
  updatedAt: "",
  currentStage: "",
  nextStage: "",
  reports: [],
  constructionPhotos: [
    {src: "assets/building/community-at-church.jpg", date: "", caption: "Воздвижение креста над алтарём строящегося храма. Веха в жизни общины и каждого из нас."},
    {src: "assets/building/prayer-within-walls.webp", date: "", caption: "Стены ещё строятся, а молитва уже живёт"},
    {src: "assets/building/hands-building-dome.webp", date: "", caption: "Трудом рук — к небесам"},
    {src: "assets/building/community-together.webp", date: "", caption: "Храм растёт, и мы становимся ближе"}
  ],
  constructionVideos: [
    {youtubeId: "-F3RpG5YSC8", cover: "assets/building/community-at-church.jpg", date: "", title: "Приглашаем стать частью строительства храма!", description: "Видео о строительстве храма Заречной общины в Нижнем Новгороде."}
  ],
  phone: "+7 (986) 747-14-25",
  email: "zarekoirpsc@mail.ru",
  contactPerson: "Председатель общины — Енышев Александр Владимирович",
  donationDetails: [
    ["Получатель", "Местная религиозная организация «Заречная Православная старообрядческая община г. Нижний Новгород»"],
    ["ИНН", "5257078174"],
    ["КПП", "525701001"],
    ["ОГРН", "1065200000271"],
    ["Расчётный счёт", "40703810142000004452"],
    ["Банк", "ВОЛГО-ВЯТСКИЙ БАНК ПАО СБЕРБАНК"],
    ["БИК", "042202603"],
    ["Корреспондентский счёт", "30101810900000000603"],
    ["Юридический адрес", "603010, г. Нижний Новгород, ул. Зеленая, д. 34, кв. 2"]
  ],
  donationText: "",
  scheduleText: ""
};
