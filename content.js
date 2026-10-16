/* Меняем данные локально. Публикуем только подтверждённые сведения.
   Для отчёта: {date: "2026-10-03", title: "...", text: "...", completed: ["..."]}
   Для фото: {src: "assets/building/photo.webp", date: "2026-10-03", caption: "..."}
   Контакты: phone, email. Пустые значения скрываются.
   Реквизиты: donationText — подтверждённый текст, без HTML. */
window.COMMUNITY_CONTENT = {
  constructionSummary: "Храм на Берёзовской находится в строительстве. Подробный отчёт о текущем этапе и выполненных работах готовится к публикации.",
  updatedAt: "",
  currentStage: "",
  nextStage: "",
  reports: [],
  constructionPhotos: [],
  phone: "",
  email: "",
  contactPerson: "",
  donationText: "",
  scheduleText: ""
};
