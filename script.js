// ==========================================
// 1. DINAMIK MODAL OYNA VA UNING STYLLARI
// ==========================================
const modalStyles = document.createElement('style');
modalStyles.innerHTML = `
  .custom-modal-overlay {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.6); display: flex; justify-content: center;
    align-items: center; z-index: 10000; opacity: 0; pointer-events: none;
    transition: all 0.3s ease;
  }
  .custom-modal-overlay.active { opacity: 1; pointer-events: auto; }
  .custom-modal-content {
    background: white; padding: 30px; border-radius: 20px;
    max-width: 550px; width: 90%; max-height: 80vh; overflow-y: auto;
    position: relative; box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    font-family: sans-serif; line-height: 1.6;
  }
  .custom-modal-close {
    position: absolute; top: 15px; right: 20px; font-size: 28px;
    cursor: pointer; color: #aaa; transition: color 0.2s;
  }
  .custom-modal-close:hover { color: #000; }
  .custom-modal-content h2 { color: rgb(3, 58, 41); margin-bottom: 15px; font-size: 24px; }
  .custom-modal-content h3 { color: rgb(155, 119, 0); margin-top: 15px; font-weight: bold; }
  .custom-modal-content p { color: #444; margin-bottom: 10px; }
  .time-input-field {
    width: 100px; padding: 2px; font-size: 18px; text-align: center;
    border: 1px solid green; border-radius: 5px; font-weight: bold;
  }
`;
document.head.appendChild(modalStyles);

const modalOverlay = document.createElement('div');
modalOverlay.className = 'custom-modal-overlay';
modalOverlay.innerHTML = `
  <div class="custom-modal-content">
    <span class="custom-modal-close">&times;</span>
    <div id="modal-body-text"></div>
  </div>
`;
document.body.appendChild(modalOverlay);

const modalBody = modalOverlay.querySelector('#modal-body-text');
const modalCloseBtn = modalOverlay.querySelector('.custom-modal-close');

function openModal(htmlContent) {
  modalBody.innerHTML = htmlContent;
  modalOverlay.classList.add('active');
}

modalCloseBtn.addEventListener('click', () => modalOverlay.classList.remove('active'));
modalOverlay.addEventListener('click', (e) => {
  if(e.target === modalOverlay) modalOverlay.classList.remove('active');
});

// ==========================================
// 2. NAMOZ VAQTLARINI O'ZGARTIRISH VA SAQLASH
// ==========================================
const cards = document.querySelectorAll('.card1');

cards.forEach((card, index) => {
  if(index === 4) {
    const h3 = card.querySelector('h3');
    if(h3 && h3.innerText === 'Shom') h3.innerText = 'Xufton';
  }

  const timeDisplay = card.querySelector('.div-div-h1-2');
  if(!timeDisplay) return;

  const prayerName = card.querySelector('h3').innerText;
  const savedTime = localStorage.getItem('prayer_' + prayerName);
  if(savedTime) {
    timeDisplay.innerText = savedTime;
  }

  timeDisplay.style.cursor = 'pointer';
  timeDisplay.title = "O'zgartirish uchun bosing";

  timeDisplay.addEventListener('click', function() {
    if(this.querySelector('input')) return;
    const currentText = this.innerText.trim().replace(/\s/g, '');
    this.innerHTML = `<input type="time" class="time-input-field" value="${currentText}">`;
    const input = this.querySelector('input');
    input.focus();

    input.addEventListener('blur', function() {
      let newTime = this.value || currentText;
      const parts = newTime.split(':');
      timeDisplay.innerText = `${parts[0]} : ${parts[1]}`;
    });

    input.addEventListener('keypress', function(ev) {
      if(ev.key === 'Enter') this.blur();
    });
  });
});

const saveBtn = document.querySelector('.div-div-button');
if(saveBtn) {
  saveBtn.addEventListener('click', () => {
    cards.forEach(card => {
      const h3 = card.querySelector('h3');
      const display = card.querySelector('.div-div-h1-2');
      if(h3 && display) {
        localStorage.setItem('prayer_' + h3.innerText, display.innerText);
      }
    });
    
    try {
      if (window.Notification && Notification.permission !== "granted") {
        Notification.requestPermission();
      }
    } catch(e) { console.log("Notification error"); }

    alert("Namoz vaqtlari muvaffaqiyatli saqlandi!");
  });
}

// ==========================================
// 3. AZON AUDIO VA AUTOMATIK TEKSHIRUV
// ==========================================
const azonAudio = new Audio('https://tvquran.com');

const testAudioBtn = document.querySelector('.div-div-button-2');
if(testAudioBtn) {
  testAudioBtn.addEventListener('click', () => {
    if(azonAudio.paused) {
      azonAudio.play().catch(err => alert("Audio ijro etilmadi. Internet aloqasini tekshiring."));
      testAudioBtn.innerText = "⏸️ To'xtatish";
    } else {
      azonAudio.pause();
      azonAudio.currentTime = 0;
      testAudioBtn.innerText = "🔊 Eshitib Korish";
    }
  });
}

setInterval(() => {
  const now = new Date();
  const currentHour = String(now.getHours()).padStart(2, '0');
  const currentMinute = String(now.getMinutes()).padStart(2, '0');
  const currentTimeString = `${currentHour}:${currentMinute}`;
  
  if(now.getSeconds() === 0) {
    cards.forEach(card => {
      const h3 = card.querySelector('h3');
      const display = card.querySelector('.div-div-h1-2');
      if(!h3 || !display) return;

      const prayerName = h3.innerText;
      const timeText = display.innerText.trim().replace(/\s/g, ''); 
      
      if(currentTimeString === timeText) {
        azonAudio.play().catch(e => console.log(e));
        
        try {
          if (window.Notification && Notification.permission === "granted") {
            new Notification("Nomoz.uz Ilovasi", { body: `Vaqt bo'ldi! ${prayerName} namozi vaqti kirdi.` });
          } else {
            alert(`Vaqt bo'ldi! ${prayerName} namozi vaqti kirdi.`);
          }
        } catch(err) {
          alert(`Vaqt bo'ldi! ${prayerName} namozi vaqti kirdi.`);
        }
      }
    });
  }
}, 1000);

// ==========================================
// 4. URGANISH TUGMALARI (TARTIB RAQAMI BO'YICHA)
// ==========================================
document.addEventListener('click', function(e) {
  // Faqat ".card2" ichidagi ".button" bosilgandagina ishlaydi
  if (e.target && e.target.classList.contains('button') && e.target.closest('.card2')) {
    
    // Barcha o'rganish tugmalarini massiv shaklida olamiz
    const allButtons = Array.from(document.querySelectorAll('.card2 .button'));
    // Bosilgan tugmaning indeksini (tartibini) aniqlaymiz (0, 1 yoki 2)
    const clickedIndex = allButtons.indexOf(e.target);

    // 1-Tugma: Tahorat (Index 0)
    if (clickedIndex === 0) {
      openModal(`
        <h2>💧 Tahorat olish tartibi</h2>
        <p>Tahorat — namoz o‘qish uchun badanni maxsus tartibda poklashdir. Quyidagi tartibda amalga oshiriladi:</p>
        <ol style="padding-left: 20px; color: #444;">
          <li><strong>Niyat qilinadi:</strong> "Niyat qildim xolisulloh uchun tahorat olmoqlikka" deb ichda aytiladi va "Bismillahir rohmanir rohiym" deyiladi.</li>
          <li><strong>Qo‘llar:</strong> Bilaklargacha 3 marta yuviladi.</li>
          <li><strong>Og‘iz va burun:</strong> Og‘iz 3 marta chayiladi, burunga 3 marta suv tortib tozalanadi.</li>
          <li><strong>Yuz:</strong> Soch chiqqan joydan iyak ostigacha bo‘lgan joy 3 marta yuviladi.</li>
          <li><strong>Qo‘llar:</strong> Avval o‘ng, keyin chap qo‘l tirsaklar bilan qo‘shib 3 marta yuviladi.</li>
          <li><strong>Masx tortish:</strong> Ho‘l qo‘l bilan boshga, quloqlar ichi-ortiga va bo‘yinga masx tortiladi.</li>
          <li><strong>Oyoqlar:</strong> Avval o‘ng, keyin chap oyoq to‘piqlari bilan 3 marta yuviladi.</li>
        </ol>
      `);
    } 
    // 2-Tugma: Nomoz tartibi (Index 1)
    else if (clickedIndex === 1) {
      openModal(`
        <h2>🧎 Namozning asosiy holatlari (Ruknlari)</h2>
        <p>Namoz holatlari ketma-ketligi quyidagicha bajariladi:</p>
        <p><strong>1. Qiyom:</strong> Qiblaga qarab tik turiladi va niyat qilinadi.</p>
        <p><strong>2. Takbir:</strong> "Allohu Akbar" deb qo'llar quloq barobariga ko'tarilib bog'lanadi.</p>
        <p><strong>3. Qiroat:</strong> Sana duosi, Fotiha va qo'shimcha sura o'qiladi.</p>
        <p><strong>4. Ruku:</strong> Eglib tizzalar ushlanadi, 3 marta "Subhana Robbiyal Aziym" deyiladi.</p>
        <p><strong>5. Sajda:</strong> Erga peshona tekkizilib 3 marta "Subhana Robbiyal A'lo" deyiladi (2 marta).</p>
        <p><strong>6. Qa'da:</strong> Tizzalab o'tirgan holda Attahiyyat va salovatlar o'qilib salom beriladi.</p>
      `);
    } 
    // 3-Tugma: Besh vaqt Nomoz (Index 2)
    else if (clickedIndex === 2) {
      openModal(`
        <h2>📿 Besh vaqt namoz rakatlari va suralar</h2>
        <h3>🌅 Bomdod namozi (4 rakat)</h3><p>2 rakat sunnat va 2 rakat farz.</p>
        <h3>☀️ Peshin namozi (10 rakat)</h3><p>4 rakat sunnat, 4 rakat farz va 2 rakat so'nggi sunnat.</p>
        <h3>🌤️ Asr namozi (4 rakat)</h3><p>4 rakat farz.</p>
        <h3>🌇 Shom namozi (5 rakat)</h3><p>3 rakat farz va 2 rakat sunnat.</p>
        <h3>🌙 Xufton namozi (5 rakat + 3 Vitr)</h3><p>4 rakat farz, 2 rakat sunnat va 3 rakat Vitr namozi.</p>
        <hr style="margin:15px 0; border:0; border-top:1px solid #ccc;"/>
        <h3>📖 Qisqa suralar:</h3>
        <p><strong>Fotiha:</strong> Alhamdulillahirobbil 'alamiyn. Ar-rohmanir rohiym. Maliki yavmiddiyn. Iyyaka na'budu va iyyaka nasta'iyn. Ihdinas sirotol mustaqiym. Sirotolaziyna an'amta 'alayhim g'oyril mag'dubiy 'alayhim valad-doolliyn.</p>
        <p><strong>Ixlos:</strong> Qul huvallohu ahad. Allohus-somad. Lam yalid va lam yuvlad. Va lam yakullahu kufuvan ahad.</p>
      `);
    }
  }
});
