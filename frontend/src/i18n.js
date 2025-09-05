export const DICT = {
    ru: {
      'nav.export':'Как\u00A0экспортировать',
      'nav.privacy':'Приватность',
      'nav.trust':'Открытый\u00A0код',
      'nav.github':'GitHub',
      'nav.cta':'Попробовать бесплатно',
      'hero.privacy':'🔐 Открытый исходный код',
      'hero.title':'Делаем вики-страничку про вас — по чатам из телеграма',
      'hero.lead':'Прочитайте собственную биографию! Мы создаём невероятно глубокую и содержательную вики-страницу о вас на основе экспорта из WhatsApp. Это приватно. Это показывает вашу динамику, психологию и помогает понять, какую жизнь вы ведёте.',
      'hero.cta':'Попробовать бесплатно',
      'hero.github':'Открытый код на GitHub',
      'hero.chat.alt':'Предпросмотр чата',
      'hero.wiki.alt':'Пример страницы в стиле Википедии',
      'export.title':'Шаг 1 — Экспортируйте чат',
      'export.sub':'Займёт ~60 секунд. Начните с чата, который лучше всего вас отражает (близкий друг, партнёр, личные заметки).',
      'tabs.aria':'Выберите мессенджер',
      'tabs.wa':'Инструкция WhatsApp',
      'tabs.tg':'Инструкция Telegram',
      'wa.s1.alt':'Откройте чат → нажмите на имя → Экспорт чата',
      'wa.s1.title':'Откройте чат → нажмите <b>имя</b> вверху → пролистайте до <span class="kbd">Экспорт чата</span>',
      'wa.s1.note':'iPhone: кнопка находится в самом низу.',
      'wa.s2.alt':'Выберите Без медиа',
      'wa.s2.title':'Выберите <b>Без медиа</b>',
      'wa.s2.note':'Так файл будет маленьким. Медиа не нужны.',
      'wa.s3.alt':'Сохраните экспорт в .txt или .zip',
      'wa.s3.title':'Сохраните файл как <code>.txt</code> (или <code>.zip</code>)',
      'wa.s3.note':'Сохраните в Files/Drive или отправьте себе на почту. На следующем шаге вы загрузите файл.',
      'tg.s1.title':'Установите эту версию <b>Telegram Desktop</b> (бета)',
      'tg.s1.note':'Скачайте с <a href="https://desktop.telegram.org/?setln=en" target="_blank" rel="noopener noreferrer">desktop.telegram.org</a>.',
      'tg.s2.title':'Откройте приложение и войдите',
      'tg.s2.note':'Используйте аккаунт с нужным чатом.',
      'tg.s3.title':'Экспортируйте историю чата',
      'tg.s3.note':'Откройте чат → нажмите троеточие (⋮) → <b>Export chat history</b>. Либо: Settings → <b>Advanced</b> → <b>Export Telegram data</b> → <b>Export chat history</b>.',
      'tg.s4.title':'Выберите формат: <b>JSON</b> и загрузите файл',
      'tg.s4.note':'JSON лучше всего подходит для точного анализа.',
      'tg.official.title':'Официальный гайд',
      'tg.official.note':'Смотрите <a href="https://telegram.org/blog/export-and-more" target="_blank" rel="noopener noreferrer">telegram.org/blog/export-and-more</a> для подробностей.',
      'tg.video.caption':'Официальное демо-видео Telegram',
      'step2.title':'Шаг 2 — Получите удивительные инсайты',
      'preview.title':'Выберите, что включить',
      'preview.sub':'Вы сами выбираете авторов/чаты. Можно исключить что угодно. После обработки ничего не хранится.',
      'preview.upload':'Загрузить файл',
      'preview.privacy':'Подробнее о приватности',
      'privacy.title':'Приватность',
      'privacy.1.title':'Открытый код',
      'privacy.1.text':'Движок анализа с открытым исходным кодом. Можно проверить и запустить локально.',
      'privacy.2.title':'Без хранения данных',
      'privacy.2.text':'Файлы обрабатываются и удаляются. Мы не храним ваши данные.',
      'privacy.3.title':'Вы выбираете, что анализировать',
      'privacy.3.text':'Выбирайте авторов/чаты для включения. Исключайте всё лишнее.',
      'trust.title':'Почему нам можно доверять',
      'trust.sub':'Мы понимаем, что это ответственно. Мы настолько впечатлены полезностью MIRROR для самоанализа, что сделали его открытым. Мы работали в серьёзных компаниях, это тоже может вдохновить на доверие. Проект создан инженерами, работавшими в Meta и JetBrains. Код открыт для ревью. Можно запускать локально.',
      'trust.github':'Открытый код на GitHub',
      'founder1.caption':'ex-Meta',
      'founder2.caption':'ex-JetBrains, ex-CTO & cofounder Eburet',
      'footer':'© MIRROR. Открытый исходный код.',
      'upload.title':'Загрузить экспорт чата',
      'upload.sub':'WhatsApp (<code>.txt</code>/<code>.zip</code>) или Telegram (<code>.json</code>). Вы выберете авторов перед анализом.',
      'drop.aria':'Область перетаскивания',
      'drop.title':'Перетащите файл сюда',
      'drop.sub':'или нажмите, чтобы выбрать файл',
      'btn.choose':'Выбрать файл',
      'btn.close':'Закрыть',
      'authors.select':'Выберите авторов для анализа',
      'retain.label':'Сохранить данные для анализа (по желанию)',
      'analyze.selected':'Анализировать выбранное',
      'analyze.count': (n)=>`Анализировать ${n.toLocaleString('ru-RU')} сообщений`,
      'progress.reading':'Чтение файла…',
      'progress.analyzing':'Анализ авторов…',
      'progress.preparing':'Подготовка…',
      'progress.ready':'Готово! Переходим…',
      'error.selectOne':'Выберите хотя бы одного автора.',
      'error.readFile':(e)=>`Не удалось прочитать файл: ${e}`,
      'error.parse':'Не удалось распарсить файл. Если это Telegram — экспортируйте в JSON.',
      'error.generic':(e)=>`Ошибка: ${e}`,
      'uuid':'UUID:'
    },
    en: {
      'nav.export':'How to Export',
      'nav.privacy':'Privacy',
      'nav.trust':'Open Source',
      'nav.github':'GitHub',
      'nav.cta':'Try for free',
      'hero.privacy':'🔐 Open-source',
      'hero.title':'A password-protected wiki-page about you with deep insights',
      'hero.lead':'Read your own biography! We make an insanely deep and insightful wiki-page about you — from your WhatsApp exports. It is private. It tells a story of your progress, psychology and helps understand what kind of life you live.',
      'hero.cta':'Try for free',
      'hero.github':'Open Source on GitHub',
      'hero.chat.alt':'Chat preview',
      'hero.wiki.alt':'Wikipedia-style profile example',
      'export.title':'Step 1 — Export your chat',
      'export.sub':'Takes ~60 seconds. Start with a chat that represents you best (close friend, partner, private notes).',
      'tabs.aria':'Choose messenger',
      'tabs.wa':'WhatsApp Instruction',
      'tabs.tg':'Telegram Instruction',
      'wa.s1.alt':'Open chat → tap name → Export Chat',
      'wa.s1.title':'Open the chat → tap the <b>name</b> at the top → scroll to <span class="kbd">Export Chat</span>',
      'wa.s1.note':'iPhone: the button is at the very bottom.',
      'wa.s2.alt':'Choose Without Media',
      'wa.s2.title':'Choose <b>Without Media</b>',
      'wa.s2.note':'Keeps the file tiny. Media isn\'t needed.',
      'wa.s3.alt':'Save export file as .txt or .zip',
      'wa.s3.title':'Save the file as <code>.txt</code> (or <code>.zip</code>)',
      'wa.s3.note':'Save to Files/Drive or email it to yourself. You\'ll upload on the next step.',
      'tg.s1.title':'Install this version of <b>Telegram Desktop</b> (beta)',
      'tg.s1.note':'Download from <a href="https://desktop.telegram.org/?setln=en" target="_blank" rel="noopener noreferrer">desktop.telegram.org</a>.',
      'tg.s2.title':'Open the app and sign in',
      'tg.s2.note':'Use the account that has the chat you want to export.',
      'tg.s3.title':'Export the chat history',
      'tg.s3.note':'Open the chat → click the three dots (⋮) → <b>Export chat history</b>. Alternatively: Settings → <b>Advanced</b> → <b>Export Telegram data</b> → <b>Export chat history</b>.',
      'tg.s4.title':'Choose format: <b>JSON</b> and upload when ready',
      'tg.s4.note':'JSON works best for accurate analysis.',
      'tg.official.title':'Official guide',
      'tg.official.note':'See <a href="https://telegram.org/blog/export-and-more" target="_blank" rel="noopener noreferrer">telegram.org/blog/export-and-more</a> for more details.',
      'tg.video.caption':'Official Telegram demo video',
      'step2.title':'Step 2 — Get amazing insights',
      'preview.title':'Choose what to include',
      'preview.sub':'You choose which authors/chats to include. Exclude anything. Nothing is stored after processing.',
      'preview.upload':'Upload a file',
      'preview.privacy':'Privacy details',
      'privacy.title':'Privacy',
      'privacy.1.title':'Open source',
      'privacy.1.text':'The analysis engine is open source. You can inspect and run it locally.',
      'privacy.2.title':'No storage',
      'privacy.2.text':'Files are processed and then deleted. We don\'t keep your data.',
      'privacy.3.title':'You choose what to analyze',
      'privacy.3.text':'Select which authors/chats to include. Exclude anything you don\'t want analyzed.',
      'trust.title':'Trusting your chats to us',
      'trust.sub':'I know it\'s scary. We were so amazed by the usefulness of MIRROR for self-analysis that we released it open-source. We also worked for respectable companies in the past. Built by ex-Meta and ex-JetBrains engineers. Code is open for review. Feel free to run locally.',
      'trust.github':'Open Source on GitHub',
      'founder1.caption':'ex-Meta',
      'founder2.caption':'ex-JetBrains, ex-Eburet CEO',
      'footer':'© MIRROR. Open-source.',
      'upload.title':'Upload chat export',
      'upload.sub':'WhatsApp (<code>.txt</code>/<code>.zip</code>) or Telegram (<code>.json</code>). You’ll choose authors before analysis.',
      'drop.aria':'Drag and drop area',
      'drop.title':'Drag & drop your file here',
      'drop.sub':'or click to choose a file',
      'btn.choose':'Choose file',
      'btn.close':'Close',
      'authors.select':'Select authors to analyze',
      'retain.label':'Retain data for analysis (optional)',
      'analyze.selected':'Analyze selected',
      'analyze.count': (n)=>`Analyze ${n.toLocaleString('en-US')} messages`,
      'progress.reading':'Reading file…',
      'progress.analyzing':'Analyzing authors…',
      'progress.preparing':'Preparing…',
      'progress.ready':'Ready! Redirecting…',
      'error.selectOne':'Select at least one author.',
      'error.readFile':(e)=>`Failed to read file: ${e}`,
      'error.parse':'Could not parse file. If this is Telegram, export as JSON.',
      'error.generic':(e)=>`Error: ${e}`,
      'uuid':'UUID:'
    }
  };
  
  export function createI18n() {
    const params = new URLSearchParams(window.location.search);
    let lang = (params.get('lang') || localStorage.getItem('mirror-lang') || 'ru').toLowerCase();
    if (!['ru','en'].includes(lang)) lang = 'ru';
  
    const saveLang = (next) => {
      if (!['ru','en'].includes(next)) return;
      lang = next;
      try { localStorage.setItem('mirror-lang', lang); } catch {}
      const p = new URLSearchParams(window.location.search);
      p.set('lang', lang);
      window.history.replaceState(null, '', `${location.pathname}?${p.toString()}${location.hash}`);
    };
  
    const t = (key, arg) => {
      const entry = DICT[lang][key];
      if (typeof entry === 'function') {
        return entry(arg);
      }
      return entry ?? key;
    };
  
    const formatNumber = (n) => Number(n).toLocaleString(lang==='ru'?'ru-RU':'en-US');
  
    return {
      get lang(){return lang;},
      setLang: (l)=>{ saveLang(l); },
      t,
      formatNumber
    };
  }
  